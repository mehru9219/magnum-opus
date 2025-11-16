/**
 * LinkedIn Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing articles to LinkedIn via OAuth 2.0 and REST API
 * Supports both personal profile and organization page publishing
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class LinkedInAdapter extends BasePlatformAdapter {
  readonly platformId = "linkedin";
  readonly platformName = "LinkedIn";
  readonly authType = "oauth" as const;

  private readonly apiBaseUrl = "https://api.linkedin.com/v2";
  private readonly oauthUrl = "https://www.linkedin.com/oauth/v2/authorization";
  private readonly tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";

  /**
   * Authenticate with LinkedIn OAuth
   */
  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      if (!credentials.accessToken) {
        return {
          success: false,
          error: "Access token required for LinkedIn authentication",
        };
      }

      // Verify token by getting user profile
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
          id: data.id,
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
   * Test connection to LinkedIn
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
        message: "Connected to LinkedIn successfully",
        platformInfo: {
          siteName: `${data.localizedFirstName} ${data.localizedLastName}`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to LinkedIn",
        error: error.message,
      };
    }
  }

  /**
   * Publish content to LinkedIn
   * LinkedIn has a 300-500 word optimal length for posts
   */
  async publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["accessToken"]);
      const sanitized = this.sanitizeContent(content);

      // Get user URN (LinkedIn ID)
      const userUrn = await this.getUserUrn(credentials.accessToken!);
      if (!userUrn) {
        throw new Error("Failed to get LinkedIn user URN");
      }

      // LinkedIn prefers shorter content (300-500 words)
      // We'll use the excerpt if available, otherwise truncate content
      const postContent = this.prepareLinkedInContent(sanitized);

      // Prepare LinkedIn UGC (User Generated Content) post
      const postData = {
        author: options?.organizationUrn || userUrn,
        lifecycleState: options?.visibility || "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: postContent,
            },
            shareMediaCategory: "ARTICLE",
            media: sanitized.featuredImage
              ? [
                  {
                    status: "READY",
                    description: {
                      text: sanitized.excerpt || sanitized.title,
                    },
                    originalUrl: sanitized.featuredImage,
                    title: {
                      text: sanitized.title,
                    },
                  },
                ]
              : [],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await this.makeRequest(`${this.apiBaseUrl}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to publish to LinkedIn");
      }

      const result = await response.json();

      // Extract post ID from URN
      const postId = result.id.split(":").pop();

      return {
        success: true,
        publishedUrl: `https://www.linkedin.com/feed/update/${result.id}`,
        publishedId: postId,
        metadata: {
          publishedAt: new Date(),
          platform: this.platformId,
          platformResponse: result,
        },
      };
    } catch (error: any) {
      return this.handleError(error, "publish");
    }
  }

  /**
   * Update existing LinkedIn post
   * Note: LinkedIn API has limited update capabilities
   */
  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    return {
      success: false,
      error: "LinkedIn does not support updating posts via API. Please delete and republish.",
    };
  }

  /**
   * Delete LinkedIn post
   */
  async delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["accessToken"]);

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/ugcPosts/${publishedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete LinkedIn post");
      }

      return {
        success: true,
        publishedId,
      };
    } catch (error: any) {
      return this.handleError(error, "delete");
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl(callbackUrl: string, state: string): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      throw new Error("LINKEDIN_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: callbackUrl,
      state,
      scope: "w_member_social r_liteprofile",
    });

    return `${this.oauthUrl}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, callbackUrl: string): Promise<OAuthResult> {
    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("LinkedIn OAuth credentials not configured");
      }

      const response = await this.makeRequest(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: callbackUrl,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange authorization code");
      }

      const data = await response.json();

      return {
        success: true,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get LinkedIn user URN
   */
  private async getUserUrn(accessToken: string): Promise<string | null> {
    try {
      const response = await this.makeRequest(`${this.apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get user profile");
      }

      const data = await response.json();
      return `urn:li:person:${data.id}`;
    } catch (error) {
      console.error("Failed to get LinkedIn user URN:", error);
      return null;
    }
  }

  /**
   * Prepare content for LinkedIn (optimal 300-500 words)
   */
  private prepareLinkedInContent(content: ArticleContent): string {
    // If excerpt exists and is reasonable length, use it
    if (content.excerpt && content.excerpt.length >= 100) {
      return `${content.title}\n\n${content.excerpt}`;
    }

    // Otherwise, create a summary from content
    const plainText = this.stripHtml(content.content);
    const words = plainText.split(/\s+/);

    // Target 400 words for LinkedIn
    const targetWords = 400;
    if (words.length <= targetWords) {
      return `${content.title}\n\n${plainText}`;
    }

    // Truncate to target length
    const truncated = words.slice(0, targetWords).join(" ");
    return `${content.title}\n\n${truncated}...\n\n[Read more]`;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }
}
