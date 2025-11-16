/**
 * Unit Tests for Base Platform Adapter
 * Agent 4: Multi-Platform Publishing Backend Developer
 */

import { describe, it, expect } from "vitest";
import {
  BasePlatformAdapter,
  ArticleContent,
  PlatformCredentials,
  PublishResult,
} from "../../lib/publishers/base-adapter";

// Mock adapter for testing
class MockAdapter extends BasePlatformAdapter {
  readonly platformId = "mock";
  readonly platformName = "Mock Platform";
  readonly authType = "api_key" as const;

  async authenticate(credentials: PlatformCredentials) {
    return { success: true, accessToken: credentials.apiKey };
  }

  async testConnection(credentials: PlatformCredentials) {
    return { success: true, message: "Connected" };
  }

  async publish(content: ArticleContent, credentials: PlatformCredentials) {
    return {
      success: true,
      publishedUrl: "https://example.com/post/123",
      publishedId: "123",
    };
  }

  async update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials
  ) {
    return {
      success: true,
      publishedUrl: "https://example.com/post/123",
      publishedId,
    };
  }

  async delete(publishedId: string, credentials: PlatformCredentials) {
    return { success: true, publishedId };
  }
}

describe("BasePlatformAdapter", () => {
  it("should sanitize content correctly", async () => {
    const adapter = new MockAdapter();
    const content: ArticleContent = {
      title: "  Test Title  ",
      content: "  Test content  ",
      tags: ["  tag1  ", "", "  tag2  "],
    };

    const result = await adapter.publish(content, { apiKey: "test" });

    expect(result.success).toBe(true);
  });

  it("should handle authentication", async () => {
    const adapter = new MockAdapter();
    const result = await adapter.authenticate({ apiKey: "test-key" });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe("test-key");
  });

  it("should test connection", async () => {
    const adapter = new MockAdapter();
    const result = await adapter.testConnection({ apiKey: "test-key" });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Connected");
  });

  it("should publish content", async () => {
    const adapter = new MockAdapter();
    const content: ArticleContent = {
      title: "Test Article",
      content: "This is test content",
    };

    const result = await adapter.publish(content, { apiKey: "test-key" });

    expect(result.success).toBe(true);
    expect(result.publishedUrl).toBeDefined();
    expect(result.publishedId).toBe("123");
  });

  it("should update content", async () => {
    const adapter = new MockAdapter();
    const content: ArticleContent = {
      title: "Updated Article",
      content: "This is updated content",
    };

    const result = await adapter.update("123", content, { apiKey: "test-key" });

    expect(result.success).toBe(true);
    expect(result.publishedId).toBe("123");
  });

  it("should delete content", async () => {
    const adapter = new MockAdapter();
    const result = await adapter.delete("123", { apiKey: "test-key" });

    expect(result.success).toBe(true);
    expect(result.publishedId).toBe("123");
  });
});
