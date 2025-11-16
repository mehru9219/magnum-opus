/**
 * WordPress Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to WordPress sites via REST API and OAuth 2.0
 * Supports both WordPress.com and self-hosted WordPress with Application Passwords
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class WordPressAdapter extends BasePlatformAdapter {
  readonly platformId = "wordpress";
  readonly platformName = "WordPress";
  readonly authType = "oauth" as const;

  private readonly wpComOAuthUrl = "https://public-api.wordpress.com/oauth2/authorize";
  private readonly wpComTokenUrl = "https://public-api.wordpress.com/oauth2/token";

  /**
   * Authenticate with WordPress
   * Supports both WordPress.com OAuth and Application Passwords
   */
  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      // For Application Passwords (self-hosted WordPress)
      if (credentials.username && credentials.password && credentials.siteUrl) {
        return await this.authenticateWithAppPassword(credentials);
      }

      // For OAuth (WordPress.com)
      if (credentials.accessToken) {
        return {
          success: true,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
        };
      }

      return {
        success: false,
        error: "Missing required credentials. Provide either accessToken or username+password+siteUrl",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Authenticate using Application Password (WordPress 5.6+)
   */
  private async authenticateWithAppPassword(
    credentials: PlatformCredentials
  ): Promise<OAuthResult> {
    try {
      const auth = Buffer.from(
        `${credentials.username}:${credentials.password}`
      ).toString("base64");

      const response = await this.makeRequest(
        `${credentials.siteUrl}/wp-json/wp/v2/users/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const userInfo = await response.json();

      return {
        success: true,
        accessToken: auth, // Store the Base64 auth for future requests
        userInfo: {
          id: userInfo.id?.toString(),
          name: userInfo.name,
          email: userInfo.email,
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
   * Test connection to WordPress site
   */
  async testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult> {
    try {
      const siteUrl = credentials.siteUrl || "https://public-api.wordpress.com";
      const headers: Record<string, string> = {};

      // Add authentication header
      if (credentials.accessToken) {
        headers.Authorization = credentials.username
          ? `Basic ${credentials.accessToken}` // Application Password
          : `Bearer ${credentials.accessToken}`; // OAuth
      }

      const response = await this.makeRequest(`${siteUrl}/wp-json`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: "Connected to WordPress successfully",
        platformInfo: {
          siteName: data.name,
          siteUrl: data.url,
          version: data.gmt_offset,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to WordPress",
        error: error.message,
      };
    }
  }

  /**
   * Publish content to WordPress
   */
  async publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["siteUrl"]);
      const sanitized = this.sanitizeContent(content);

      const siteUrl = credentials.siteUrl || "https://public-api.wordpress.com";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authentication
      if (credentials.accessToken) {
        headers.Authorization = credentials.username
          ? `Basic ${credentials.accessToken}`
          : `Bearer ${credentials.accessToken}`;
      }

      // Prepare WordPress post data
      const postData: any = {
        title: sanitized.title,
        content: sanitized.content,
        excerpt: sanitized.excerpt || "",
        status: options?.status || "publish",
        author: options?.authorId,
        categories: options?.categoryIds || [],
        tags: options?.tagIds || [],
      };

      // Add featured image if provided
      if (sanitized.featuredImage) {
        postData.featured_media = await this.uploadFeaturedImage(
          sanitized.featuredImage,
          credentials
        );
      }

      // Add meta if provided
      if (sanitized.seo) {
        postData.meta = {
          _yoast_wpseo_title: sanitized.seo.metaTitle,
          _yoast_wpseo_metadesc: sanitized.seo.metaDescription,
          _yoast_wpseo_focuskw: sanitized.seo.focusKeyword,
        };
      }

      const response = await this.makeRequest(`${siteUrl}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish to WordPress");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: result.link,
        publishedId: result.id.toString(),
        metadata: {
          publishedAt: new Date(result.date),
          platform: this.platformId,
          platformResponse: result,
        },
      };
    } catch (error: any) {
      return this.handleError(error, "publish");
    }
  }

  /**
   * Update existing WordPress post
   */
  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["siteUrl"]);
      const sanitized = this.sanitizeContent(content);

      const siteUrl = credentials.siteUrl || "https://public-api.wordpress.com";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (credentials.accessToken) {
        headers.Authorization = credentials.username
          ? `Basic ${credentials.accessToken}`
          : `Bearer ${credentials.accessToken}`;
      }

      const postData: any = {
        title: sanitized.title,
        content: sanitized.content,
        excerpt: sanitized.excerpt || "",
      };

      const response = await this.makeRequest(
        `${siteUrl}/wp-json/wp/v2/posts/${publishedId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update WordPress post");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: result.link,
        publishedId: result.id.toString(),
        metadata: {
          publishedAt: new Date(result.modified),
          platform: this.platformId,
        },
      };
    } catch (error: any) {
      return this.handleError(error, "update");
    }
  }

  /**
   * Delete WordPress post
   */
  async delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["siteUrl"]);

      const siteUrl = credentials.siteUrl || "https://public-api.wordpress.com";
      const headers: Record<string, string> = {};

      if (credentials.accessToken) {
        headers.Authorization = credentials.username
          ? `Basic ${credentials.accessToken}`
          : `Bearer ${credentials.accessToken}`;
      }

      const response = await this.makeRequest(
        `${siteUrl}/wp-json/wp/v2/posts/${publishedId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete WordPress post");
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
    const clientId = process.env.WORDPRESS_CLIENT_ID;
    if (!clientId) {
      throw new Error("WORDPRESS_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      state,
      scope: "auth",
    });

    return `${this.wpComOAuthUrl}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, callbackUrl: string): Promise<OAuthResult> {
    try {
      const clientId = process.env.WORDPRESS_CLIENT_ID;
      const clientSecret = process.env.WORDPRESS_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("WordPress OAuth credentials not configured");
      }

      const response = await this.makeRequest(this.wpComTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
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
   * Upload featured image to WordPress media library
   */
  private async uploadFeaturedImage(
    imageUrl: string,
    credentials: PlatformCredentials
  ): Promise<number | undefined> {
    try {
      // For now, return undefined
      // In production, this would download the image and upload to WordPress
      return undefined;
    } catch (error) {
      console.error("Failed to upload featured image:", error);
      return undefined;
    }
  }
}
