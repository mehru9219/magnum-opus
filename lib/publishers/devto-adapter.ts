/**
 * Dev.to Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to Dev.to via API key authentication
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class DevToAdapter extends BasePlatformAdapter {
  readonly platformId = "devto";
  readonly platformName = "Dev.to";
  readonly authType = "api_key" as const;

  private readonly apiBaseUrl = "https://dev.to/api";

  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      this.validateCredentials(credentials, ["apiKey"]);

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
      this.validateCredentials(credentials, ["apiKey"]);

      const response = await this.makeRequest(`${this.apiBaseUrl}/users/me`, {
        method: "GET",
        headers: {
          "api-key": credentials.apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: "Connected to Dev.to successfully",
        platformInfo: {
          siteName: data.name,
          siteUrl: `https://dev.to/${data.username}`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Dev.to",
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

      // Dev.to expects Markdown format
      const articleData = {
        article: {
          title: sanitized.title,
          body_markdown: sanitized.content,
          published: options?.published !== false,
          tags: sanitized.tags?.slice(0, 4) || [], // Dev.to allows max 4 tags
          canonical_url: options?.canonicalUrl,
          description: sanitized.excerpt,
        },
      };

      const response = await this.makeRequest(`${this.apiBaseUrl}/articles`, {
        method: "POST",
        headers: {
          "api-key": credentials.apiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to publish to Dev.to");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: result.url,
        publishedId: result.id.toString(),
        metadata: {
          publishedAt: new Date(result.published_at),
          platform: this.platformId,
          platformResponse: result,
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

      const articleData = {
        article: {
          title: sanitized.title,
          body_markdown: sanitized.content,
          tags: sanitized.tags?.slice(0, 4) || [],
          description: sanitized.excerpt,
        },
      };

      const response = await this.makeRequest(`${this.apiBaseUrl}/articles/${publishedId}`, {
        method: "PUT",
        headers: {
          "api-key": credentials.apiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error("Failed to update Dev.to article");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: result.url,
        publishedId: result.id.toString(),
      };
    } catch (error: any) {
      return this.handleError(error, "update");
    }
  }

  async delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult> {
    return {
      success: false,
      error: "Dev.to does not support deleting articles via API",
    };
  }
}
