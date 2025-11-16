/**
 * Content Adaptation Engine
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Adapts content for different publishing platforms based on their specific requirements:
 * - WordPress: HTML format
 * - Medium: Rich text/Markdown
 * - LinkedIn: 300-500 words (shorter content)
 * - Dev.to: Markdown
 * - Ghost: HTML/Markdown
 * - Shopify: HTML
 * - Webflow: HTML/Rich text
 * - etc.
 */

import { ArticleContent } from "../publishers/base-adapter";

/**
 * Platform-specific content requirements
 */
export interface PlatformRequirements {
  maxLength?: number; // Maximum character/word count
  format: "html" | "markdown" | "richtext" | "plain";
  maxTags?: number;
  maxCategories?: number;
  imageSupport: boolean;
  excerptRequired: boolean;
  seoFieldsSupport: boolean;
  customFieldsSupport: boolean;
}

/**
 * Platform content requirements registry
 */
export const PLATFORM_REQUIREMENTS: Record<string, PlatformRequirements> = {
  wordpress: {
    format: "html",
    maxTags: 20,
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: true,
    customFieldsSupport: true,
  },
  shopify: {
    format: "html",
    maxTags: 10,
    imageSupport: true,
    excerptRequired: true,
    seoFieldsSupport: false,
    customFieldsSupport: false,
  },
  medium: {
    format: "markdown",
    maxTags: 5,
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: false,
    customFieldsSupport: false,
  },
  linkedin: {
    format: "plain",
    maxLength: 500, // words
    maxTags: 0,
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: false,
    customFieldsSupport: false,
  },
  webflow: {
    format: "html",
    imageSupport: true,
    excerptRequired: true,
    seoFieldsSupport: true,
    customFieldsSupport: true,
  },
  devto: {
    format: "markdown",
    maxTags: 4,
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: false,
    customFieldsSupport: false,
  },
  ghost: {
    format: "html",
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: true,
    customFieldsSupport: true,
  },
  wix: {
    format: "html",
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: false,
    customFieldsSupport: false,
  },
  squarespace: {
    format: "html",
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: true,
    customFieldsSupport: false,
  },
  custom: {
    format: "html",
    imageSupport: true,
    excerptRequired: false,
    seoFieldsSupport: true,
    customFieldsSupport: true,
  },
};

/**
 * Adaptation options
 */
export interface AdaptationOptions {
  preserveFormatting?: boolean;
  customTitle?: string;
  customExcerpt?: string;
  customTags?: string[];
}

/**
 * Adapt content for a specific platform
 */
export function adaptContent(
  content: ArticleContent,
  platform: string,
  options?: AdaptationOptions
): ArticleContent {
  const requirements = PLATFORM_REQUIREMENTS[platform] || PLATFORM_REQUIREMENTS.custom;

  let adapted: ArticleContent = {
    ...content,
    title: options?.customTitle || content.title,
    excerpt: options?.customExcerpt || content.excerpt,
    tags: options?.customTags || content.tags,
  };

  // Adapt content format
  adapted = adaptFormat(adapted, requirements);

  // Adapt content length
  adapted = adaptLength(adapted, requirements);

  // Adapt tags
  adapted = adaptTags(adapted, requirements);

  // Remove unsupported fields
  adapted = removeUnsupportedFields(adapted, requirements);

  return adapted;
}

/**
 * Convert content to required format
 */
function adaptFormat(
  content: ArticleContent,
  requirements: PlatformRequirements
): ArticleContent {
  const currentFormat = detectFormat(content.content);

  // If formats match, no conversion needed
  if (currentFormat === requirements.format) {
    return content;
  }

  let convertedContent = content.content;

  // Convert between formats
  if (currentFormat === "html" && requirements.format === "markdown") {
    convertedContent = htmlToMarkdown(content.content);
  } else if (currentFormat === "markdown" && requirements.format === "html") {
    convertedContent = markdownToHtml(content.content);
  } else if (requirements.format === "plain") {
    convertedContent = toPlainText(content.content);
  }

  return {
    ...content,
    content: convertedContent,
  };
}

/**
 * Adapt content length for platform requirements
 */
function adaptLength(
  content: ArticleContent,
  requirements: PlatformRequirements
): ArticleContent {
  if (!requirements.maxLength) {
    return content;
  }

  const words = content.content.split(/\s+/);

  if (words.length <= requirements.maxLength) {
    return content;
  }

  // Truncate to max length
  const truncated = words.slice(0, requirements.maxLength).join(" ");
  const excerpt = content.excerpt || truncated.slice(0, 200) + "...";

  return {
    ...content,
    content: truncated + "...\n\n[Read full article]",
    excerpt,
  };
}

/**
 * Adapt tags to platform limits
 */
function adaptTags(
  content: ArticleContent,
  requirements: PlatformRequirements
): ArticleContent {
  if (!content.tags || !requirements.maxTags) {
    return content;
  }

  return {
    ...content,
    tags: content.tags.slice(0, requirements.maxTags),
  };
}

/**
 * Remove fields not supported by platform
 */
function removeUnsupportedFields(
  content: ArticleContent,
  requirements: PlatformRequirements
): ArticleContent {
  const adapted = { ...content };

  if (!requirements.imageSupport) {
    delete adapted.featuredImage;
  }

  if (!requirements.seoFieldsSupport) {
    delete adapted.seo;
  }

  if (!requirements.customFieldsSupport) {
    delete adapted.customFields;
  }

  if (!requirements.excerptRequired && !adapted.excerpt) {
    // Generate excerpt from content if required but not provided
    adapted.excerpt = generateExcerpt(content.content);
  }

  return adapted;
}

/**
 * Detect content format
 */
function detectFormat(content: string): "html" | "markdown" | "plain" {
  // Simple heuristic to detect format
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return "html";
  }

  if (/[\*_#\[\]`]/.test(content)) {
    return "markdown";
  }

  return "plain";
}

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
  // Basic HTML to Markdown conversion
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n");
  markdown = markdown.replace(/<h4>(.*?)<\/h4>/gi, "#### $1\n\n");

  // Bold and italic
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  markdown = markdown.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i>(.*?)<\/i>/gi, "*$1*");

  // Links
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)");

  // Images
  markdown = markdown.replace(/<img src="(.*?)" alt="(.*?)">/gi, "![$2]($1)");

  // Lists
  markdown = markdown.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gis, "$1");
  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gis, "$1");

  // Paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");

  // Code blocks
  markdown = markdown.replace(/<pre><code>(.*?)<\/code><\/pre>/gis, "```\n$1\n```\n");
  markdown = markdown.replace(/<code>(.*?)<\/code>/gi, "`$1`");

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  markdown = markdown
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  return markdown.trim();
}

/**
 * Convert Markdown to HTML
 */
function markdownToHtml(markdown: string): string {
  // Basic Markdown to HTML conversion
  let html = markdown;

  // Headers
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Lists
  html = html.replace(/^\- (.*$)/gim, "<li>$1</li>");

  // Paragraphs (double line breaks)
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  return html;
}

/**
 * Convert to plain text
 */
function toPlainText(content: string): string {
  let plain = content;

  // Remove HTML tags
  plain = plain.replace(/<[^>]*>/g, "");

  // Remove Markdown formatting
  plain = plain.replace(/\*\*(.*?)\*\*/g, "$1");
  plain = plain.replace(/\*(.*?)\*/g, "$1");
  plain = plain.replace(/\[(.*?)\]\(.*?\)/g, "$1");
  plain = plain.replace(/!\[.*?\]\(.*?\)/g, "");
  plain = plain.replace(/`(.*?)`/g, "$1");
  plain = plain.replace(/^#{1,6}\s/gm, "");

  // Decode HTML entities
  plain = plain
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  return plain.trim();
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = toPlainText(content);
  const words = plainText.split(/\s+/);

  if (words.length <= 30) {
    return plainText;
  }

  const excerpt = words.slice(0, 30).join(" ");
  return excerpt.slice(0, maxLength) + "...";
}

/**
 * Batch adapt content for multiple platforms
 */
export function adaptContentForMultiplePlatforms(
  content: ArticleContent,
  platforms: string[],
  options?: AdaptationOptions
): Record<string, ArticleContent> {
  const adaptedContent: Record<string, ArticleContent> = {};

  for (const platform of platforms) {
    adaptedContent[platform] = adaptContent(content, platform, options);
  }

  return adaptedContent;
}
