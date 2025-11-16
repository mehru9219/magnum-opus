/**
 * Base Platform Adapter Interface
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Defines the contract that all publishing platform adapters must implement.
 * Supports authentication, publishing, updating, and deleting content across platforms.
 */

/**
 * Article content structure for publishing
 */
export interface ArticleContent {
  title: string;
  content: string; // Markdown or HTML
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  categories?: string[];
  author?: {
    name: string;
    email?: string;
    bio?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  };
  customFields?: Record<string, any>;
}

/**
 * Platform-specific credentials
 */
export interface PlatformCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
  siteUrl?: string;
  username?: string;
  password?: string;
  customConfig?: Record<string, any>;
}

/**
 * Result of a publishing operation
 */
export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  publishedId?: string; // Platform-specific post/article ID
  error?: string;
  errorDetails?: any;
  metadata?: {
    publishedAt?: Date;
    platform?: string;
    platformResponse?: any;
  };
}

/**
 * OAuth authentication result
 */
export interface OAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  userInfo?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

/**
 * Platform connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  platformInfo?: {
    siteName?: string;
    siteUrl?: string;
    version?: string;
  };
  error?: string;
}

/**
 * Base interface that all platform adapters must implement
 */
export interface IPlatformAdapter {
  /**
   * Platform identifier (wordpress, shopify, medium, etc.)
   */
  readonly platformId: string;

  /**
   * Platform display name
   */
  readonly platformName: string;

  /**
   * Authentication method type
   */
  readonly authType: "oauth" | "api_key" | "basic" | "custom";

  /**
   * Authenticate with the platform
   * @param credentials - Platform-specific credentials
   * @returns Authentication result
   */
  authenticate(credentials: PlatformCredentials): Promise<OAuthResult>;

  /**
   * Test connection to the platform
   * @param credentials - Platform credentials
   * @returns Connection test result
   */
  testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult>;

  /**
   * Publish new content to the platform
   * @param content - Article content to publish
   * @param credentials - Platform credentials
   * @param options - Platform-specific publish options
   * @returns Publish result with URL and ID
   */
  publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult>;

  /**
   * Update existing published content
   * @param publishedId - Platform-specific post/article ID
   * @param content - Updated article content
   * @param credentials - Platform credentials
   * @param options - Platform-specific update options
   * @returns Update result
   */
  update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult>;

  /**
   * Delete published content
   * @param publishedId - Platform-specific post/article ID
   * @param credentials - Platform credentials
   * @returns Deletion result
   */
  delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult>;

  /**
   * Refresh OAuth tokens if needed
   * @param credentials - Current credentials with refresh token
   * @returns New credentials with refreshed tokens
   */
  refreshTokens?(credentials: PlatformCredentials): Promise<OAuthResult>;

  /**
   * Get OAuth authorization URL for user to grant access
   * @param callbackUrl - Callback URL after authorization
   * @param state - State parameter for CSRF protection
   * @returns Authorization URL
   */
  getOAuthUrl?(callbackUrl: string, state: string): string;

  /**
   * Handle OAuth callback and exchange code for tokens
   * @param code - Authorization code from OAuth provider
   * @param callbackUrl - Callback URL (must match the one used in getOAuthUrl)
   * @returns OAuth result with tokens
   */
  handleOAuthCallback?(code: string, callbackUrl: string): Promise<OAuthResult>;
}

/**
 * Abstract base class providing common functionality for platform adapters
 */
export abstract class BasePlatformAdapter implements IPlatformAdapter {
  abstract readonly platformId: string;
  abstract readonly platformName: string;
  abstract readonly authType: "oauth" | "api_key" | "basic" | "custom";

  abstract authenticate(credentials: PlatformCredentials): Promise<OAuthResult>;

  abstract testConnection(credentials: PlatformCredentials): Promise<ConnectionTestResult>;

  abstract publish(
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult>;

  abstract update(
    publishedId: string,
    content: ArticleContent,
    credentials: PlatformCredentials,
    options?: Record<string, any>
  ): Promise<PublishResult>;

  abstract delete(
    publishedId: string,
    credentials: PlatformCredentials
  ): Promise<PublishResult>;

  /**
   * Helper method to make HTTP requests with error handling
   */
  protected async makeRequest(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`);
    }
  }

  /**
   * Helper method to handle API errors
   */
  protected handleError(error: any, operation: string): PublishResult {
    console.error(`${this.platformName} ${operation} error:`, error);

    return {
      success: false,
      error: error.message || `${operation} failed`,
      errorDetails: error,
    };
  }

  /**
   * Helper method to validate required credentials
   */
  protected validateCredentials(
    credentials: PlatformCredentials,
    required: (keyof PlatformCredentials)[]
  ): void {
    const missing = required.filter((key) => !credentials[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required credentials: ${missing.join(", ")}`);
    }
  }

  /**
   * Helper method to sanitize content for platform-specific requirements
   */
  protected sanitizeContent(content: ArticleContent): ArticleContent {
    return {
      ...content,
      title: content.title.trim(),
      content: content.content.trim(),
      excerpt: content.excerpt?.trim(),
      tags: content.tags?.filter((tag) => tag.trim().length > 0),
      categories: content.categories?.filter((cat) => cat.trim().length > 0),
    };
  }
}

/**
 * Utility type for platform adapter constructors
 */
export type PlatformAdapterConstructor = new () => IPlatformAdapter;

/**
 * Registry of all available platform adapters
 */
export class PlatformAdapterRegistry {
  private static adapters: Map<string, IPlatformAdapter> = new Map();

  /**
   * Register a platform adapter
   */
  static register(adapter: IPlatformAdapter): void {
    this.adapters.set(adapter.platformId, adapter);
  }

  /**
   * Get adapter for a specific platform
   */
  static getAdapter(platformId: string): IPlatformAdapter | undefined {
    return this.adapters.get(platformId);
  }

  /**
   * Get all registered adapters
   */
  static getAllAdapters(): IPlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if platform is supported
   */
  static isSupported(platformId: string): boolean {
    return this.adapters.has(platformId);
  }
}
