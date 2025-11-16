/**
 * Medium Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to Medium via OAuth 2.0 and REST API
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class MediumAdapter extends BasePlatformAdapter {
  readonly platformId = "medium";
  readonly platformName = "Medium";
  readonly authType = "oauth" as const;

  private readonly apiBaseUrl = "https://api.medium.com/v1";
  private readonly oauthUrl = "https://medium.com/m/oauth/authorize";

  /**
   * Authenticate with Medium OAuth
   */
  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      if (!credentials.accessToken) {
        return {
          success: false,
          error: "Access token required for Medium authentication",
        };
      }

      // Verify token by getting user info
      const response = await this.makeRequest(`${this.apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid access token");
      }

      const data = await response.json();

      return {
        success: true,
        accessToken: credentials.accessToken,
        userInfo: {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test connection to Medium
   */
  async testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult> {
    try {
      this.validateCredentials(credentials, ["accessToken"]);

      const response = await this.makeRequest(`${this.apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: "Connected to Medium successfully",
        platformInfo: {
          siteName: data.data.name,
          siteUrl: data.data.url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Medium",
        error: error.message,
      };
    }
  }

  /**
   * Publish content to Medium
   */
  async publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["accessToken"]);
      const sanitized = this.sanitizeContent(content);

      // Get user ID first
      const userIdResult = await this.getUserId(credentials.accessToken!);
      if (!userIdResult.success || !userIdResult.userId) {
        throw new Error("Failed to get Medium user ID");
      }

      // Convert content to Medium's format (Markdown or HTML)
      const contentFormat = this.detectContentFormat(sanitized.content);

      // Prepare Medium post data
      const postData = {
        title: sanitized.title,
        contentFormat,
        content: sanitized.content,
        tags: sanitized.tags?.slice(0, 5) || [], // Medium allows max 5 tags
        publishStatus: options?.publishStatus || "public", // "public", "draft", or "unlisted"
        canonicalUrl: options?.canonicalUrl,
        notifyFollowers: options?.notifyFollowers !== false,
      };

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/users/${userIdResult.userId}/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to publish to Medium");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: result.data.url,
        publishedId: result.data.id,
        metadata: {
          publishedAt: new Date(result.data.publishedAt),
          platform: this.platformId,
          platformResponse: result.data,
        },
      };
    } catch (error: any) {
      return this.handleError(error, "publish");
    }
  }

  /**
   * Update existing Medium post
   * Note: Medium API doesn't support updating posts after publication
   */
  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    return {
      success: false,
      error: "Medium does not support updating published posts via API",
    };
  }

  /**
   * Delete Medium post
   * Note: Medium API doesn't support deleting posts
   */
  async delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult> {
    return {
      success: false,
      error: "Medium does not support deleting posts via API",
    };
  }

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl(callbackUrl: string, state: string): string {
    const clientId = process.env.MEDIUM_CLIENT_ID;
    if (!clientId) {
      throw new Error("MEDIUM_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      scope: "basicProfile,publishPost",
      state,
      response_type: "code",
      redirect_uri: callbackUrl,
    });

    return `${this.oauthUrl}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, callbackUrl: string): Promise<OAuthResult> {
    try {
      const clientId = process.env.MEDIUM_CLIENT_ID;
      const clientSecret = process.env.MEDIUM_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Medium OAuth credentials not configured");
      }

      const response = await this.makeRequest("https://api.medium.com/v1/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: callbackUrl,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange authorization code");
      }

      const data = await response.json();

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_at ? data.expires_at - Date.now() : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Medium user ID from access token
   */
  private async getUserId(
    accessToken: string
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const response = await this.makeRequest(`${this.apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get user info");
      }

      const data = await response.json();

      return {
        success: true,
        userId: data.data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detect content format (HTML or Markdown)
   */
  private detectContentFormat(content: string): "html" | "markdown" {
    // Simple heuristic: if content has HTML tags, it's HTML
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    return hasHtmlTags ? "html" : "markdown";
  }
}
