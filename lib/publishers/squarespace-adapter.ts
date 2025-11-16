/**
 * Squarespace Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to Squarespace via API
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class SquarespaceAdapter extends BasePlatformAdapter {
  readonly platformId = "squarespace";
  readonly platformName = "Squarespace";
  readonly authType = "api_key" as const;

  private readonly apiBaseUrl = "https://api.squarespace.com";

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

      const response = await this.makeRequest(`${this.apiBaseUrl}/1.0/blog/posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: "Connected to Squarespace successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Squarespace",
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
        title: sanitized.title,
        body: sanitized.content,
        excerpt: sanitized.excerpt,
        tags: sanitized.tags || [],
        categories: sanitized.categories || [],
        publishOn: new Date().toISOString(),
      };

      const response = await this.makeRequest(`${this.apiBaseUrl}/1.0/blog/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish to Squarespace");
      }

      const result = await response.json();

      return {
        success: true,
        publishedId: result.id,
        publishedUrl: result.fullUrl,
        metadata: {
          publishedAt: new Date(result.publishOn),
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
        title: sanitized.title,
        body: sanitized.content,
        excerpt: sanitized.excerpt,
        tags: sanitized.tags || [],
        categories: sanitized.categories || [],
      };

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/1.0/blog/posts/${publishedId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Squarespace post");
      }

      const result = await response.json();

      return {
        success: true,
        publishedId: result.id,
        publishedUrl: result.fullUrl,
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
        `${this.apiBaseUrl}/1.0/blog/posts/${publishedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete Squarespace post");
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
