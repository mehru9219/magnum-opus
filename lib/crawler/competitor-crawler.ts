/**
 * Competitor Web Crawler
 *
 * Uses Playwright to crawl competitor sites and extract content for analysis.
 * Respects robots.txt and implements rate limiting.
 *
 * Part of Week 5 - Smart Optimization Scanner
 */

import { chromium, Browser, Page } from "playwright";
import * as robotsParser from "robots-parser";

/**
 * Crawled Page Data
 */
export interface CrawledPage {
  url: string;
  title: string;
  metaDescription?: string;
  contentMarkdown: string;
  wordCount: number;
  headings: Array<{
    level: number;
    text: string;
  }>;
  keywords: string[];
  internalLinks: string[];
  externalLinks: string[];
  hasFAQ: boolean;
  hasSchema: boolean;
}

/**
 * Crawler Configuration
 */
export interface CrawlerConfig {
  maxPages: number;           // Default: 100
  maxDepth: number;            // Default: 3
  respectRobotsTxt: boolean;   // Default: true
  rateLimitMs: number;         // Delay between requests (ms), default: 2000
  timeout: number;             // Page load timeout (ms), default: 30000
  userAgent?: string;
}

/**
 * Crawler Result
 */
export interface CrawlResult {
  success: boolean;
  pagesCrawled: number;
  pages: CrawledPage[];
  errors: string[];
  skippedUrls: string[];
}

/**
 * CompetitorCrawler Class
 *
 * Crawls competitor websites and extracts structured content
 */
export class CompetitorCrawler {
  private config: CrawlerConfig;
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private robotsRules: any = null;
  private baseUrl: string = "";

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      maxPages: config.maxPages || 100,
      maxDepth: config.maxDepth || 3,
      respectRobotsTxt: config.respectRobotsTxt !== false,
      rateLimitMs: config.rateLimitMs || 2000,
      timeout: config.timeout || 30000,
      userAgent: config.userAgent || "MagnumOpusBot/1.0 (SEO Analysis)",
    };
  }

  /**
   * Initialize browser instance
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
  }

  /**
   * Close browser instance
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Fetch and parse robots.txt
   */
  private async fetchRobotsTxt(baseUrl: string): Promise<void> {
    if (!this.config.respectRobotsTxt) {
      return;
    }

    try {
      const robotsUrl = new URL("/robots.txt", baseUrl).href;
      const response = await fetch(robotsUrl);
      const robotsTxt = await response.text();

      this.robotsRules = robotsParser(robotsUrl, robotsTxt);
    } catch (error) {
      console.warn(`Failed to fetch robots.txt for ${baseUrl}:`, error);
      // Continue without robots.txt rules
    }
  }

  /**
   * Check if URL is allowed by robots.txt
   */
  private isAllowedByRobots(url: string): boolean {
    if (!this.config.respectRobotsTxt || !this.robotsRules) {
      return true;
    }

    return this.robotsRules.isAllowed(url, this.config.userAgent) !== false;
  }

  /**
   * Normalize URL (remove fragments, trailing slashes, etc.)
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove fragment
      parsed.hash = "";
      // Remove trailing slash
      if (parsed.pathname.endsWith("/") && parsed.pathname.length > 1) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      return parsed.href;
    } catch {
      return url;
    }
  }

  /**
   * Check if URL is internal (same domain)
   */
  private isInternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseObj = new URL(this.baseUrl);
      return urlObj.hostname === baseObj.hostname;
    } catch {
      return false;
    }
  }

  /**
   * Extract content from a single page
   */
  private async extractPageContent(page: Page, url: string): Promise<CrawledPage | null> {
    try {
      // Wait for page to load
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
      });

      // Extract title
      const title = await page.title();

      // Extract meta description
      const metaDescription = await page.$eval(
        'meta[name="description"]',
        (el) => el.getAttribute("content") || undefined
      ).catch(() => undefined);

      // Extract headings
      const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (elements) =>
        elements.map((el) => ({
          level: parseInt(el.tagName.substring(1)),
          text: el.textContent?.trim() || "",
        }))
      );

      // Extract main content (remove nav, footer, scripts, styles)
      const contentMarkdown = await page.evaluate(() => {
        // Remove unwanted elements
        const unwantedSelectors = [
          "nav",
          "header",
          "footer",
          "aside",
          "script",
          "style",
          "iframe",
          ".advertisement",
          ".ad",
          "#comments",
        ];

        unwantedSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => el.remove());
        });

        // Get main content
        const main = document.querySelector("main") || document.querySelector("article") || document.body;
        return main?.textContent?.trim() || "";
      });

      // Calculate word count
      const wordCount = contentMarkdown.split(/\s+/).filter((word) => word.length > 0).length;

      // Extract keywords from meta tags
      const keywords = await page.$$eval('meta[name="keywords"]', (elements) =>
        elements.flatMap((el) => {
          const content = el.getAttribute("content") || "";
          return content.split(",").map((kw) => kw.trim());
        })
      ).catch(() => []);

      // Extract all links
      const links = await page.$$eval("a[href]", (elements) =>
        elements.map((el) => el.getAttribute("href") || "").filter((href) => href.length > 0)
      );

      // Resolve relative URLs
      const resolvedLinks = links.map((href) => {
        try {
          return new URL(href, url).href;
        } catch {
          return href;
        }
      });

      // Separate internal and external links
      const internalLinks = resolvedLinks.filter((link) => this.isInternalUrl(link));
      const externalLinks = resolvedLinks.filter((link) => !this.isInternalUrl(link));

      // Check for FAQ schema
      const hasFAQ = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.some((script) => {
          try {
            const data = JSON.parse(script.textContent || "");
            return data["@type"] === "FAQPage" || data["@type"]?.includes("FAQPage");
          } catch {
            return false;
          }
        });
      });

      // Check for any schema.org markup
      const hasSchema = await page.evaluate(() => {
        return document.querySelectorAll('script[type="application/ld+json"]').length > 0;
      });

      return {
        url,
        title,
        metaDescription,
        contentMarkdown,
        wordCount,
        headings,
        keywords,
        internalLinks,
        externalLinks,
        hasFAQ,
        hasSchema,
      };
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error);
      return null;
    }
  }

  /**
   * Crawl a competitor website
   *
   * @param startUrl - The starting URL to crawl
   * @returns CrawlResult with all crawled pages
   */
  public async crawl(startUrl: string): Promise<CrawlResult> {
    const result: CrawlResult = {
      success: false,
      pagesCrawled: 0,
      pages: [],
      errors: [],
      skippedUrls: [],
    };

    try {
      // Initialize
      this.baseUrl = new URL(startUrl).origin;
      await this.initBrowser();
      await this.fetchRobotsTxt(this.baseUrl);

      // BFS queue: [url, depth]
      const queue: Array<[string, number]> = [[startUrl, 0]];
      this.visitedUrls.clear();

      while (queue.length > 0 && result.pages.length < this.config.maxPages) {
        const [currentUrl, depth] = queue.shift()!;

        // Skip if already visited
        const normalizedUrl = this.normalizeUrl(currentUrl);
        if (this.visitedUrls.has(normalizedUrl)) {
          continue;
        }

        // Check robots.txt
        if (!this.isAllowedByRobots(normalizedUrl)) {
          result.skippedUrls.push(normalizedUrl);
          continue;
        }

        // Mark as visited
        this.visitedUrls.add(normalizedUrl);

        // Create new page
        const page = await this.browser!.newPage();
        await page.setUserAgent(this.config.userAgent!);

        try {
          // Extract content
          const pageData = await this.extractPageContent(page, normalizedUrl);

          if (pageData) {
            result.pages.push(pageData);
            result.pagesCrawled++;

            // If within depth limit, add internal links to queue
            if (depth < this.config.maxDepth) {
              pageData.internalLinks.forEach((link) => {
                const normalizedLink = this.normalizeUrl(link);
                if (!this.visitedUrls.has(normalizedLink)) {
                  queue.push([normalizedLink, depth + 1]);
                }
              });
            }
          }
        } catch (error: any) {
          result.errors.push(`Error crawling ${normalizedUrl}: ${error.message}`);
        } finally {
          await page.close();
        }

        // Rate limiting
        if (queue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.config.rateLimitMs));
        }
      }

      result.success = true;
    } catch (error: any) {
      result.errors.push(`Crawler error: ${error.message}`);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  /**
   * Crawl a single page (no following links)
   */
  public async crawlSinglePage(url: string): Promise<CrawledPage | null> {
    try {
      await this.initBrowser();
      const page = await this.browser!.newPage();
      await page.setUserAgent(this.config.userAgent!);

      const pageData = await this.extractPageContent(page, url);

      await page.close();
      await this.closeBrowser();

      return pageData;
    } catch (error) {
      console.error(`Error crawling single page ${url}:`, error);
      return null;
    }
  }
}

/**
 * Helper: Crawl competitor site and return structured data
 */
export async function crawlCompetitor(
  startUrl: string,
  config?: Partial<CrawlerConfig>
): Promise<CrawlResult> {
  const crawler = new CompetitorCrawler(config);
  return await crawler.crawl(startUrl);
}

/**
 * Helper: Crawl single page
 */
export async function crawlPage(url: string): Promise<CrawledPage | null> {
  const crawler = new CompetitorCrawler();
  return await crawler.crawlSinglePage(url);
}
