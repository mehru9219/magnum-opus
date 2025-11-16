/**
 * Webflow Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements publishing to Webflow CMS via OAuth 2.0 and CMS API
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class WebflowAdapter extends BasePlatformAdapter {
  readonly platformId = "webflow";
  readonly platformName = "Webflow";
  readonly authType = "oauth" as const;

  private readonly apiBaseUrl = "https://api.webflow.com";

  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      if (!credentials.accessToken) {
        return { success: false, error: "Access token required" };
      }

      return {
        success: true,
        accessToken: credentials.accessToken,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult> {
    try {
      this.validateCredentials(credentials, ["accessToken"]);

      const response = await this.makeRequest(`${this.apiBaseUrl}/sites`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: "Connected to Webflow successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Webflow",
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
      this.validateCredentials(credentials, ["accessToken"]);
      const sanitized = this.sanitizeContent(content);

      const siteId = credentials.customConfig?.siteId || options?.siteId;
      const collectionId = credentials.customConfig?.collectionId || options?.collectionId;

      if (!siteId || !collectionId) {
        throw new Error("Webflow siteId and collectionId are required");
      }

      const itemData = {
        fields: {
          name: sanitized.title,
          slug: this.slugify(sanitized.title),
          "post-body": sanitized.content,
          "post-summary": sanitized.excerpt || "",
          _archived: false,
          _draft: options?.draft || false,
        },
      };

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/collections/${collectionId}/items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to publish to Webflow");
      }

      const result = await response.json();

      return {
        success: true,
        publishedId: result._id,
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
      this.validateCredentials(credentials, ["accessToken"]);
      const sanitized = this.sanitizeContent(content);

      const collectionId = credentials.customConfig?.collectionId || options?.collectionId;

      if (!collectionId) {
        throw new Error("Webflow collectionId is required");
      }

      const itemData = {
        fields: {
          name: sanitized.title,
          "post-body": sanitized.content,
          "post-summary": sanitized.excerpt || "",
        },
      };

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/collections/${collectionId}/items/${publishedId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Webflow item");
      }

      return {
        success: true,
        publishedId,
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
      this.validateCredentials(credentials, ["accessToken"]);

      const collectionId = credentials.customConfig?.collectionId;

      if (!collectionId) {
        throw new Error("Webflow collectionId is required");
      }

      const response = await this.makeRequest(
        `${this.apiBaseUrl}/collections/${collectionId}/items/${publishedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete Webflow item");
      }

      return {
        success: true,
        publishedId,
      };
    } catch (error: any) {
      return this.handleError(error, "delete");
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
