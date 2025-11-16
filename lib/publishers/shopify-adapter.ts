/**
 * Shopify Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing blog articles to Shopify stores via Admin API
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class ShopifyAdapter extends BasePlatformAdapter {
  readonly platformId = "shopify";
  readonly platformName = "Shopify";
  readonly authType = "api_key" as const;

  /**
   * Authenticate with Shopify Admin API
   */
  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);

      // Test authentication by making a simple API call
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
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test connection to Shopify store
   */
  async testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);

      const shopUrl = this.normalizeShopUrl(credentials.siteUrl!);
      const response = await this.makeRequest(`${shopUrl}/admin/api/2024-01/shop.json`, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": credentials.apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: "Connected to Shopify successfully",
        platformInfo: {
          siteName: data.shop.name,
          siteUrl: data.shop.domain,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Shopify",
        error: error.message,
      };
    }
  }

  /**
   * Publish blog article to Shopify
   */
  async publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);
      const sanitized = this.sanitizeContent(content);

      const shopUrl = this.normalizeShopUrl(credentials.siteUrl!);
      const blogId = options?.blogId || await this.getDefaultBlogId(credentials);

      // Prepare Shopify article data
      const articleData = {
        article: {
          title: sanitized.title,
          body_html: sanitized.content,
          summary_html: sanitized.excerpt || "",
          tags: sanitized.tags?.join(", ") || "",
          published: options?.status !== "draft",
          author: sanitized.author?.name || "Admin",
        },
      };

      const response = await this.makeRequest(
        `${shopUrl}/admin/api/2024-01/blogs/${blogId}/articles.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": credentials.apiKey!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || "Failed to publish to Shopify");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: `https://${credentials.siteUrl}/blogs/${result.article.blog_id}/articles/${result.article.id}`,
        publishedId: result.article.id.toString(),
        metadata: {
          publishedAt: new Date(result.article.published_at),
          platform: this.platformId,
          platformResponse: result.article,
        },
      };
    } catch (error: any) {
      return this.handleError(error, "publish");
    }
  }

  /**
   * Update existing Shopify article
   */
  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);
      const sanitized = this.sanitizeContent(content);

      const shopUrl = this.normalizeShopUrl(credentials.siteUrl!);
      const blogId = options?.blogId || await this.getDefaultBlogId(credentials);

      const articleData = {
        article: {
          id: parseInt(publishedId),
          title: sanitized.title,
          body_html: sanitized.content,
          summary_html: sanitized.excerpt || "",
          tags: sanitized.tags?.join(", ") || "",
        },
      };

      const response = await this.makeRequest(
        `${shopUrl}/admin/api/2024-01/blogs/${blogId}/articles/${publishedId}.json`,
        {
          method: "PUT",
          headers: {
            "X-Shopify-Access-Token": credentials.apiKey!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Shopify article");
      }

      const result = await response.json();

      return {
        success: true,
        publishedUrl: `https://${credentials.siteUrl}/blogs/${result.article.blog_id}/articles/${result.article.id}`,
        publishedId: result.article.id.toString(),
      };
    } catch (error: any) {
      return this.handleError(error, "update");
    }
  }

  /**
   * Delete Shopify article
   */
  async delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult> {
    try {
      this.validateCredentials(credentials, ["apiKey", "siteUrl"]);

      const shopUrl = this.normalizeShopUrl(credentials.siteUrl!);
      const blogId = await this.getDefaultBlogId(credentials);

      const response = await this.makeRequest(
        `${shopUrl}/admin/api/2024-01/blogs/${blogId}/articles/${publishedId}.json`,
        {
          method: "DELETE",
          headers: {
            "X-Shopify-Access-Token": credentials.apiKey!,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete Shopify article");
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
   * Normalize Shopify shop URL
   */
  private normalizeShopUrl(siteUrl: string): string {
    // Remove protocol if present
    let url = siteUrl.replace(/^https?:\/\//, "");

    // Add .myshopify.com if not present
    if (!url.includes(".myshopify.com")) {
      url = `${url}.myshopify.com`;
    }

    return `https://${url}`;
  }

  /**
   * Get default blog ID for the store
   */
  private async getDefaultBlogId(credentials: PlatformCredentials): Promise<number> {
    try {
      const shopUrl = this.normalizeShopUrl(credentials.siteUrl!);
      const response = await this.makeRequest(`${shopUrl}/admin/api/2024-01/blogs.json`, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": credentials.apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await response.json();

      if (!data.blogs || data.blogs.length === 0) {
        throw new Error("No blogs found in Shopify store");
      }

      return data.blogs[0].id;
    } catch (error: any) {
      throw new Error(`Failed to get default blog ID: ${error.message}`);
    }
  }
}
