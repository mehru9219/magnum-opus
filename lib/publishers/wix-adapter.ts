/**
 * Wix Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to Wix Blog via API
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class WixAdapter extends BasePlatformAdapter {
  readonly platformId = "wix";
  readonly platformName = "Wix";
  readonly authType = "api_key" as const;

  private readonly apiBaseUrl = "https://www.wixapis.com";

  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      this.validateCredentials(credentials, ["apiKey"]);

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
      this.validateCredentials(credentials, ["apiKey"]);

      const response = await this.makeRequest(`${this.apiBaseUrl}/blog/v3/posts`, {
        method: "GET",
        headers: {
          Authorization: credentials.apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: "Connected to Wix successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Wix",
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
      this.validateCredentials(credentials, ["apiKey"]);
      const sanitized = this.sanitizeContent(content);

      const postData = {
        post: {
          title: sanitized.title,
          content: sanitized.content,
          excerpt: sanitized.excerpt,
          tags: sanitized.tags || [],
          status: options?.status || "PUBLISHED",
        },
      };

      const response = await this.makeRequest(`${this.apiBaseUrl}/blog/v3/posts`, {
        method: "POST",
        headers: {
          Authorization: credentials.apiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish to Wix");
      }

      const result = await response.json();

      return {
        success: true,
        publishedId: result.post.id,
        publishedUrl: result.post.url,
        metadata: {
          publishedAt: new Date(),
          platform: this.platformId,
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
      this.validateCredentials(credentials, ["apiKey"]);
      const sanitized = this.sanitizeContent(content);

      const postData = {
        post: {
          title: sanitized.title,
          content: sanitized.content,
          excerpt: sanitized.excerpt,
          tags: sanitized.tags || [],
        },
      };

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/blog/v3/posts/${publishedId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: credentials.apiKey!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Wix post");
      }

      const result = await response.json();

      return {
        success: true,
        publishedId: result.post.id,
        publishedUrl: result.post.url,
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
      this.validateCredentials(credentials, ["apiKey"]);

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/blog/v3/posts/${publishedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: credentials.apiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete Wix post");
      }

      return {
        success: true,
        publishedId,
      };
    } catch (error: any) {
      return this.handleError(error, "delete");
    }
  }
}
