/**
 * Custom CMS Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Implements webhook-based publishing for custom CMS systems
 * Allows users to integrate any CMS via configurable webhooks
 */

import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
  OAuthResult,
  ConnectionTestResult,
} from "./base-adapter";

export class CustomAdapter extends BasePlatformAdapter {
  readonly platformId = "custom";
  readonly platformName = "Custom CMS";
  readonly authType = "custom" as const;

  async authenticate(credentials: PlatformCredentials): Promise<OAuthResult> {
    try {
      // For custom CMS, authentication depends on the webhook configuration
      // We just validate that the required fields are present

      if (!credentials.customConfig?.webhookUrl) {
        return {
          success: false,
          error: "Webhook URL is required for Custom CMS",
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
      const webhookUrl = credentials.customConfig?.webhookUrl;
      const testEndpoint = credentials.customConfig?.testEndpoint;

      if (!webhookUrl) {
        throw new Error("Webhook URL is required");
      }

      // If a test endpoint is configured, use it
      if (testEndpoint) {
        const response = await this.makeRequest(testEndpoint, {
          method: "GET",
          headers: this.buildHeaders(credentials),
        });

        if (!response.ok) {
          throw new Error(`Connection test failed: ${response.statusText}`);
        }

        return {
          success: true,
          message: "Connected to Custom CMS successfully",
        };
      }

      // If no test endpoint, just verify webhook URL is valid
      try {
        new URL(webhookUrl);
        return {
          success: true,
          message: "Webhook URL configured (test endpoint not available)",
        };
      } catch {
        throw new Error("Invalid webhook URL");
      }
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to connect to Custom CMS",
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
      const webhookUrl = credentials.customConfig?.webhookUrl;

      if (!webhookUrl) {
        throw new Error("Webhook URL is required");
      }

      const sanitized = this.sanitizeContent(content);

      // Build webhook payload
      const payload = this.buildWebhookPayload(sanitized, credentials, options);

      const response = await this.makeRequest(webhookUrl, {
        method: credentials.customConfig?.method || "POST",
        headers: this.buildHeaders(credentials),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to publish to Custom CMS");
      }

      const result = await response.json();

      // Extract published ID and URL from response
      // The user can configure which fields contain these values
      const idField = credentials.customConfig?.responseIdField || "id";
      const urlField = credentials.customConfig?.responseUrlField || "url";

      return {
        success: true,
        publishedId: this.extractField(result, idField),
        publishedUrl: this.extractField(result, urlField),
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

  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult> {
    try {
      const updateUrl =
        credentials.customConfig?.updateWebhookUrl ||
        `${credentials.customConfig?.webhookUrl}/${publishedId}`;

      if (!updateUrl) {
        throw new Error("Update webhook URL is required");
      }

      const sanitized = this.sanitizeContent(content);
      const payload = this.buildWebhookPayload(sanitized, credentials, options);

      const response = await this.makeRequest(updateUrl, {
        method: credentials.customConfig?.updateMethod || "PUT",
        headers: this.buildHeaders(credentials),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update Custom CMS content");
      }

      const result = await response.json();
      const urlField = credentials.customConfig?.responseUrlField || "url";

      return {
        success: true,
        publishedId,
        publishedUrl: this.extractField(result, urlField),
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
      const deleteUrl =
        credentials.customConfig?.deleteWebhookUrl ||
        `${credentials.customConfig?.webhookUrl}/${publishedId}`;

      if (!deleteUrl) {
        throw new Error("Delete webhook URL is required");
      }

      const response = await this.makeRequest(deleteUrl, {
        method: credentials.customConfig?.deleteMethod || "DELETE",
        headers: this.buildHeaders(credentials),
      });

      if (!response.ok) {
        throw new Error("Failed to delete Custom CMS content");
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
   * Build headers for webhook requests
   */
  private buildHeaders(credentials: PlatformCredentials): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication header if configured
    if (credentials.apiKey) {
      const authHeader = credentials.customConfig?.authHeader || "Authorization";
      const authPrefix = credentials.customConfig?.authPrefix || "Bearer";
      headers[authHeader] = `${authPrefix} ${credentials.apiKey}`;
    }

    // Add custom headers if configured
    if (credentials.customConfig?.customHeaders) {
      Object.assign(headers, credentials.customConfig.customHeaders);
    }

    return headers;
  }

  /**
   * Build webhook payload from article content
   */
  private buildWebhookPayload(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): any {
    // Use custom payload template if configured
    if (credentials.customConfig?.payloadTemplate) {
      return this.applyTemplate(credentials.customConfig.payloadTemplate, content);
    }

    // Default payload structure
    return {
      title: content.title,
      content: content.content,
      excerpt: content.excerpt,
      tags: content.tags,
      categories: content.categories,
      author: content.author,
      seo: content.seo,
      featuredImage: content.featuredImage,
      customFields: content.customFields,
      ...options,
    };
  }

  /**
   * Apply template to content
   */
  private applyTemplate(template: any, content: ArticleContent): any {
    const templateStr = JSON.stringify(template);
    const replacedStr = templateStr.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return (content as any)[key] || match;
    });
    return JSON.parse(replacedStr);
  }

  /**
   * Extract field from nested object using dot notation
   */
  private extractField(obj: any, field: string): string {
    const parts = field.split(".");
    let value = obj;

    for (const part of parts) {
      if (value && typeof value === "object") {
        value = value[part];
      } else {
        return "";
      }
    }

    return value?.toString() || "";
  }
}
