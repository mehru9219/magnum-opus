/**
 * Platform Adapters Registry
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Central registry for all publishing platform adapters
 * Exports all adapters and provides utility functions for adapter management
 */

// Import all platform adapters
import { WordPressAdapter } from "./wordpress-adapter";
import { ShopifyAdapter } from "./shopify-adapter";
import { MediumAdapter } from "./medium-adapter";
import { LinkedInAdapter } from "./linkedin-adapter";
import { WebflowAdapter } from "./webflow-adapter";
import { DevToAdapter } from "./devto-adapter";
import { GhostAdapter } from "./ghost-adapter";
import { WixAdapter } from "./wix-adapter";
import { SquarespaceAdapter } from "./squarespace-adapter";
import { CustomAdapter } from "./custom-adapter";

// Export base types and interfaces
export * from "./base-adapter";

// Export all adapters
export {
  WordPressAdapter,
  ShopifyAdapter,
  MediumAdapter,
  LinkedInAdapter,
  WebflowAdapter,
  DevToAdapter,
  GhostAdapter,
  WixAdapter,
  SquarespaceAdapter,
  CustomAdapter,
};

// Import types
import type { IPlatformAdapter } from "./base-adapter";

/**
 * Platform adapter instances map
 */
const adapterInstances: Map<string, IPlatformAdapter> = new Map();

/**
 * Initialize all platform adapters
 */
export function initializeAdapters(): void {
  adapterInstances.set("wordpress", new WordPressAdapter());
  adapterInstances.set("shopify", new ShopifyAdapter());
  adapterInstances.set("medium", new MediumAdapter());
  adapterInstances.set("linkedin", new LinkedInAdapter());
  adapterInstances.set("webflow", new WebflowAdapter());
  adapterInstances.set("devto", new DevToAdapter());
  adapterInstances.set("ghost", new GhostAdapter());
  adapterInstances.set("wix", new WixAdapter());
  adapterInstances.set("squarespace", new SquarespaceAdapter());
  adapterInstances.set("custom", new CustomAdapter());
}

/**
 * Get platform adapter by ID
 */
export function getAdapter(platformId: string): IPlatformAdapter | undefined {
  if (adapterInstances.size === 0) {
    initializeAdapters();
  }

  return adapterInstances.get(platformId);
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): IPlatformAdapter[] {
  if (adapterInstances.size === 0) {
    initializeAdapters();
  }

  return Array.from(adapterInstances.values());
}

/**
 * Check if platform is supported
 */
export function isPlatformSupported(platformId: string): boolean {
  if (adapterInstances.size === 0) {
    initializeAdapters();
  }

  return adapterInstances.has(platformId);
}

/**
 * Get adapter by platform ID with type safety
 */
export function getAdapterSafe(platformId: string): IPlatformAdapter {
  const adapter = getAdapter(platformId);

  if (!adapter) {
    throw new Error(`Unsupported platform: ${platformId}`);
  }

  return adapter;
}

/**
 * Get list of supported platform IDs
 */
export function getSupportedPlatformIds(): string[] {
  if (adapterInstances.size === 0) {
    initializeAdapters();
  }

  return Array.from(adapterInstances.keys());
}

/**
 * Platform metadata
 */
export const PLATFORM_METADATA = {
  wordpress: {
    name: "WordPress",
    description: "WordPress.com and self-hosted WordPress sites",
    category: "cms",
    popularity: "high",
    features: ["oauth", "api_key", "seo", "custom_fields"],
  },
  shopify: {
    name: "Shopify",
    description: "Shopify blog posts",
    category: "ecommerce",
    popularity: "high",
    features: ["api_key", "blog"],
  },
  medium: {
    name: "Medium",
    description: "Medium publications and personal blog",
    category: "publishing",
    popularity: "high",
    features: ["oauth", "social"],
  },
  linkedin: {
    name: "LinkedIn",
    description: "LinkedIn personal profile and company pages",
    category: "social",
    popularity: "high",
    features: ["oauth", "social", "professional"],
  },
  webflow: {
    name: "Webflow",
    description: "Webflow CMS collections",
    category: "cms",
    popularity: "medium",
    features: ["oauth", "design", "seo"],
  },
  devto: {
    name: "Dev.to",
    description: "Dev.to developer community",
    category: "community",
    popularity: "medium",
    features: ["api_key", "developer", "markdown"],
  },
  ghost: {
    name: "Ghost",
    description: "Ghost CMS",
    category: "cms",
    popularity: "medium",
    features: ["api_key", "newsletter", "seo"],
  },
  wix: {
    name: "Wix",
    description: "Wix blog",
    category: "website_builder",
    popularity: "high",
    features: ["api_key"],
  },
  squarespace: {
    name: "Squarespace",
    description: "Squarespace blog",
    category: "website_builder",
    popularity: "medium",
    features: ["api_key", "design"],
  },
  custom: {
    name: "Custom CMS",
    description: "Custom webhook-based integration",
    category: "custom",
    popularity: "low",
    features: ["webhook", "custom", "flexible"],
  },
};

/**
 * Get platform metadata
 */
export function getPlatformMetadata(platformId: string) {
  return PLATFORM_METADATA[platformId as keyof typeof PLATFORM_METADATA];
}

/**
 * Get platforms by category
 */
export function getPlatformsByCategory(category: string): string[] {
  return Object.entries(PLATFORM_METADATA)
    .filter(([_, meta]) => meta.category === category)
    .map(([id, _]) => id);
}

/**
 * Initialize adapters on module load
 */
initializeAdapters();
