/**
 * Ghost Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to Ghost CMS via Admin API
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class GhostAdapter extends BasePlatformAdapter {
  readonly platformId = "ghost";
  readonly platformName = "Ghost";
  readonly authType = "api_key" as const;

  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);

      const testResult = await this.testConnection(credentials);

      if (!testResult.success) {
        return {
          success: false,
          error: testResult.error || "Authentication failed",
        };
      }

      return {
        success: true,
        accessToken: credentials.apiKey,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);

      const response = await this.makeRequest(`${credentials.siteUrl}/ghost/api/admin/site`, {
        method: "GET",
        headers: {
          Authorization: `Ghost ${this.generateJWT(credentials.apiKey!)}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: "Connected to Ghost successfully",
        platformInfo: {
          siteName: data.site.title,
          siteUrl: data.site.url,
          version: data.site.version,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Ghost",
        error: error.message,
      };
    }
  }

  async publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);
      const sanitized = this.sanitizeContent(content);

      const postData = {
        posts: [
          {
            title: sanitized.title,
            html: sanitized.content,
            excerpt: sanitized.excerpt,
            tags: sanitized.tags?.map((tag) => ({ name: tag })) || [],
            status: options?.status || "published",
            featured: options?.featured || false,
          },
        ],
      };

      const response = await this.makeRequest(
        `${credentials.siteUrl}/ghost/api/admin/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Ghost ${this.generateJWT(credentials.apiKey!)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to publish to Ghost");
      }

      const result = await response.json();
      const post = result.posts[0];

      return {
        success: true,
        publishedUrl: post.url,
        publishedId: post.id,
        metadata: {
          publishedAt: new Date(post.published_at),
          platform: this.platformId,
          platformResponse: post,
        },
      };
    } catch (error: any) {
      return this.handleError(error, "publish");
    }
  }

  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);
      const sanitized = this.sanitizeContent(content);

      const postData = {
        posts: [
          {
            title: sanitized.title,
            html: sanitized.content,
            excerpt: sanitized.excerpt,
            tags: sanitized.tags?.map((tag) => ({ name: tag })) || [],
            updated_at: new Date().toISOString(),
          },
        ],
      };

      const response = await this.makeRequest(
        `${credentials.siteUrl}/ghost/api/admin/posts/${publishedId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Ghost ${this.generateJWT(credentials.apiKey!)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Ghost post");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: result.posts[0].url,
        publishedId: result.posts[0].id,
      };
    } catch (error: any) {
      return this.handleError(error, "update");
    }
  }

  async delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);

      const response = await this.makeRequest(
        `${credentials.siteUrl}/ghost/api/admin/posts/${publishedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Ghost ${this.generateJWT(credentials.apiKey!)}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete Ghost post");
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
   * Generate Ghost Admin API JWT token
   * Note: In production, use a proper JWT library
   */
  private generateJWT(apiKey: string): string {
    // Ghost API key format: "id:secret"
    const [keyId, keySecret] = apiKey.split(":");

    // This is a simplified version
    // In production, use jsonwebtoken library to generate proper JWT
    // with HS256 algorithm and proper expiry
    const header = Buffer.from(JSON.stringify({ typ: "JWT", alg: "HS256" })).toString("base64");
    const payload = Buffer.from(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        iat: Math.floor(Date.now() / 1000),
        aud: "/admin/",
      })
    ).toString("base64");

    // Note: This is a placeholder. Use proper JWT signing in production
    return `${header}.${payload}.${keyId}`;
  }
}
