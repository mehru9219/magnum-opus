/**
 * Unit Tests for Content Adaptation Engine
 * Agent 4: Multi-Platform Publishing Backend Developer
 */

import { describe, it, expect } from "vitest";
import {
  adaptContent,
  adaptContentForMultiplePlatforms,
  PLATFORM_REQUIREMENTS,
} from "../../lib/content-adapter/adapt-content";
import { ArticleContent } from "../../lib/publishers/base-adapter";

describe("Content Adaptation Engine", () => {
  const sampleContent: ArticleContent = {
    title: "Test Article",
    content: "<h1>Heading</h1><p>This is a paragraph with <strong>bold</strong> text.</p>",
    excerpt: "This is an excerpt",
    tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  };

  describe("adaptContent", () => {
    it("should adapt content for WordPress (HTML)", () => {
      const adapted = adaptContent(sampleContent, "wordpress");

      expect(adapted.title).toBe("Test Article");
      expect(adapted.content).toContain("<h1>");
      expect(adapted.tags?.length).toBeLessThanOrEqual(
        PLATFORM_REQUIREMENTS.wordpress.maxTags || Infinity
      );
    });

    it("should adapt content for Medium (Markdown)", () => {
      const adapted = adaptContent(sampleContent, "medium");

      expect(adapted.content).toContain("# Heading");
      expect(adapted.tags?.length).toBeLessThanOrEqual(5); // Medium allows max 5 tags
    });

    it("should adapt content for LinkedIn (Plain text with length limit)", () => {
      const longContent: ArticleContent = {
        title: "Long Article",
        content: Array(1000).fill("word").join(" "),
      };

      const adapted = adaptContent(longContent, "linkedin");

      // LinkedIn has a word limit
      expect(adapted.content.length).toBeLessThan(longContent.content.length);
    });

    it("should adapt content for Dev.to (Markdown)", () => {
      const adapted = adaptContent(sampleContent, "devto");

      expect(adapted.content).toContain("# Heading");
      expect(adapted.tags?.length).toBeLessThanOrEqual(4); // Dev.to allows max 4 tags
    });

    it("should handle custom titles and excerpts", () => {
      const adapted = adaptContent(sampleContent, "wordpress", {
        customTitle: "Custom Title",
        customExcerpt: "Custom excerpt",
      });

      expect(adapted.title).toBe("Custom Title");
      expect(adapted.excerpt).toBe("Custom excerpt");
    });

    it("should handle custom tags", () => {
      const adapted = adaptContent(sampleContent, "wordpress", {
        customTags: ["custom1", "custom2"],
      });

      expect(adapted.tags).toEqual(["custom1", "custom2"]);
    });

    it("should remove unsupported fields", () => {
      const contentWithSEO: ArticleContent = {
        ...sampleContent,
        seo: {
          metaTitle: "SEO Title",
          metaDescription: "SEO Description",
        },
      };

      // LinkedIn doesn't support SEO fields
      const adapted = adaptContent(contentWithSEO, "linkedin");

      expect(adapted.seo).toBeUndefined();
    });
  });

  describe("adaptContentForMultiplePlatforms", () => {
    it("should adapt content for multiple platforms", () => {
      const platforms = ["wordpress", "medium", "linkedin"];
      const adaptedContents = adaptContentForMultiplePlatforms(
        sampleContent,
        platforms
      );

      expect(Object.keys(adaptedContents)).toHaveLength(3);
      expect(adaptedContents.wordpress).toBeDefined();
      expect(adaptedContents.medium).toBeDefined();
      expect(adaptedContents.linkedin).toBeDefined();

      // WordPress should have HTML
      expect(adaptedContents.wordpress.content).toContain("<h1>");

      // Medium should have Markdown
      expect(adaptedContents.medium.content).toContain("# Heading");
    });
  });

  describe("Format Conversion", () => {
    it("should convert HTML to Markdown", () => {
      const htmlContent: ArticleContent = {
        title: "HTML Article",
        content: "<h1>Title</h1><p>Paragraph with <strong>bold</strong></p>",
      };

      const adapted = adaptContent(htmlContent, "medium");

      expect(adapted.content).toContain("# Title");
      expect(adapted.content).toContain("**bold**");
    });

    it("should convert Markdown to HTML", () => {
      const markdownContent: ArticleContent = {
        title: "Markdown Article",
        content: "# Title\n\nParagraph with **bold**",
      };

      const adapted = adaptContent(markdownContent, "wordpress");

      expect(adapted.content).toContain("<h1>Title</h1>");
      expect(adapted.content).toContain("<strong>bold</strong>");
    });

    it("should convert to plain text", () => {
      const htmlContent: ArticleContent = {
        title: "HTML Article",
        content: "<h1>Title</h1><p>Paragraph with <strong>bold</strong></p>",
      };

      const adapted = adaptContent(htmlContent, "linkedin");

      expect(adapted.content).not.toContain("<");
      expect(adapted.content).not.toContain("**");
      expect(adapted.content).toContain("Title");
      expect(adapted.content).toContain("bold");
    });
  });

  describe("Tag Limits", () => {
    const contentWithManyTags: ArticleContent = {
      title: "Article",
      content: "Content",
      tags: Array(20).fill(0).map((_, i) => `tag${i}`),
    };

    it("should limit tags for Medium (max 5)", () => {
      const adapted = adaptContent(contentWithManyTags, "medium");
      expect(adapted.tags?.length).toBe(5);
    });

    it("should limit tags for Dev.to (max 4)", () => {
      const adapted = adaptContent(contentWithManyTags, "devto");
      expect(adapted.tags?.length).toBe(4);
    });

    it("should limit tags for Shopify (max 10)", () => {
      const adapted = adaptContent(contentWithManyTags, "shopify");
      expect(adapted.tags?.length).toBe(10);
    });
  });

  describe("Platform Requirements", () => {
    it("should have requirements defined for all platforms", () => {
      const platforms = [
        "wordpress",
        "shopify",
        "medium",
        "linkedin",
        "webflow",
        "devto",
        "ghost",
        "wix",
        "squarespace",
        "custom",
      ];

      platforms.forEach((platform) => {
        expect(PLATFORM_REQUIREMENTS[platform]).toBeDefined();
        expect(PLATFORM_REQUIREMENTS[platform].format).toBeDefined();
      });
    });
  });
});
