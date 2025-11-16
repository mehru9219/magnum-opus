/**
 * Platform Connection Manager
 * Agent 4: Multi-Platform Publishing Backend Developer
 *
 * Manages platform connections, credentials storage, and connection testing
 * Handles encrypted credential storage and platform authentication
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Import platform adapters
// Note: These will be imported dynamically in actions since they use fetch
// which is not available in Convex mutations/queries

/**
 * Store encrypted credentials for a platform connection
 * Note: In production, use proper encryption for credentials
 */
export const storeCredentials = mutation({
  args: {
    platform: v.string(),
    credentials: v.object({
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      apiKey: v.optional(v.string()),
      apiSecret: v.optional(v.string()),
      siteUrl: v.optional(v.string()),
      username: v.optional(v.string()),
      password: v.optional(v.string()),
      customConfig: v.optional(v.any()),
    }),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Encrypt credentials before storing (placeholder - use proper encryption in production)
    const encryptedCredentials = encryptCredentials(args.credentials);

    // Check if connection already exists
    const existing = await ctx.db
      .query("platformConnections")
      .withIndex("by_user_platform", (q) =>
        q.eq("userId", identity.subject).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        credentials: encryptedCredentials,
        displayName: args.displayName,
        status: "active",
        lastSynced: Date.now(),
      });

      return { success: true, connectionId: existing._id };
    }

    // Create new connection
    const connectionId = await ctx.db.insert("platformConnections", {
      userId: identity.subject,
      platform: args.platform,
      credentials: encryptedCredentials,
      displayName: args.displayName,
      status: "pending", // Will be "active" after successful test
      connectedAt: Date.now(),
      lastSynced: Date.now(),
    });

    return { success: true, connectionId };
  },
});

/**
 * Test platform connection
 * This is an action because it needs to call external APIs
 */
export const testPlatformConnection = action({
  args: {
    connectionId: v.id("platformConnections"),
  },
  handler: async (ctx, args) => {
    // Get connection from database
    const connection = await ctx.runQuery(
      async (ctx) => {
        const conn = await ctx.db.get(args.connectionId);
        return conn;
      },
      {}
    );

    if (!connection) {
      return {
        success: false,
        error: "Connection not found",
      };
    }

    try {
      // Decrypt credentials
      const credentials = decryptCredentials(connection.credentials);

      // Dynamically import adapter based on platform
      const adapter = await getPlatformAdapter(connection.platform);

      if (!adapter) {
        throw new Error(`Unsupported platform: ${connection.platform}`);
      }

      // Test connection
      const result = await adapter.testConnection(credentials);

      // Update connection status
      await ctx.runMutation(
        async (ctx, args) => {
          await ctx.db.patch(args.connectionId, {
            status: args.success ? "active" : "error",
            lastSynced: Date.now(),
          });
        },
        {
          connectionId: args.connectionId,
          success: result.success,
        }
      );

      return result;
    } catch (error: any) {
      return {
        success: false,
        message: "Connection test failed",
        error: error.message,
      };
    }
  },
});

/**
 * Get decrypted credentials for a platform connection
 * Used by publishing jobs
 */
export const getConnectionCredentials = query({
  args: {
    connectionId: v.id("platformConnections"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const connection = await ctx.db.get(args.connectionId);

    if (!connection || connection.userId !== identity.subject) {
      return null;
    }

    // Return decrypted credentials
    return {
      platform: connection.platform,
      credentials: decryptCredentials(connection.credentials),
      status: connection.status,
    };
  },
});

/**
 * List all platform connections for user
 */
export const listPlatformConnections = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const connections = await ctx.db
      .query("platformConnections")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.neq(q.field("status"), "disconnected"))
      .collect();

    // Return connections without credentials
    return connections.map((conn) => ({
      _id: conn._id,
      platform: conn.platform,
      displayName: conn.displayName,
      status: conn.status,
      connectedAt: conn.connectedAt,
      lastSynced: conn.lastSynced,
    }));
  },
});

/**
 * Disconnect a platform
 */
export const disconnectPlatform = mutation({
  args: {
    connectionId: v.id("platformConnections"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db.get(args.connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.connectionId, {
      status: "disconnected",
      lastSynced: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reconnect a platform (refresh credentials)
 */
export const reconnectPlatform = mutation({
  args: {
    connectionId: v.id("platformConnections"),
    newCredentials: v.object({
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      apiKey: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db.get(args.connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    if (connection.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Merge new credentials with existing
    const existingCredentials = decryptCredentials(connection.credentials);
    const updatedCredentials = {
      ...existingCredentials,
      ...args.newCredentials,
    };

    const encryptedCredentials = encryptCredentials(updatedCredentials);

    await ctx.db.patch(args.connectionId, {
      credentials: encryptedCredentials,
      status: "pending", // Will be "active" after test
      lastSynced: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get platform statistics
 */
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalConnections: 0,
        activeConnections: 0,
        platformBreakdown: {},
      };
    }

    const connections = await ctx.db
      .query("platformConnections")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const activeConnections = connections.filter((c) => c.status === "active");

    const platformBreakdown: Record<string, number> = {};
    for (const conn of activeConnections) {
      platformBreakdown[conn.platform] = (platformBreakdown[conn.platform] || 0) + 1;
    }

    return {
      totalConnections: connections.length,
      activeConnections: activeConnections.length,
      platformBreakdown,
    };
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Encrypt credentials
 * Note: This is a placeholder. In production, use proper encryption (AES-256, etc.)
 */
function encryptCredentials(credentials: any): any {
  // TODO: Implement proper encryption using a library like crypto-js
  // For now, just store as-is (NOT SECURE - placeholder only)
  return credentials;
}

/**
 * Decrypt credentials
 * Note: This is a placeholder. In production, use proper decryption
 */
function decryptCredentials(encryptedCredentials: any): any {
  // TODO: Implement proper decryption
  // For now, just return as-is (NOT SECURE - placeholder only)
  return encryptedCredentials;
}

/**
 * Get platform adapter instance
 * Note: This needs to be imported dynamically in actions
 */
async function getPlatformAdapter(platform: string): Promise<any> {
  // This is a placeholder - actual implementation would dynamically import adapters
  // For now, return null and implement in publishing action

  // Example of how it would work:
  // const { WordPressAdapter } = await import("../lib/publishers/wordpress-adapter");
  // return new WordPressAdapter();

  return null;
}

/**
 * Supported platforms list
 */
export const getSupportedPlatforms = query({
  args: {},
  handler: async () => {
    return [
      {
        id: "wordpress",
        name: "WordPress",
        authType: "oauth",
        description: "WordPress.com and self-hosted WordPress sites",
        icon: "wordpress",
      },
      {
        id: "shopify",
        name: "Shopify",
        authType: "api_key",
        description: "Shopify blog posts",
        icon: "shopify",
      },
      {
        id: "medium",
        name: "Medium",
        authType: "oauth",
        description: "Medium publications and personal blog",
        icon: "medium",
      },
      {
        id: "linkedin",
        name: "LinkedIn",
        authType: "oauth",
        description: "LinkedIn personal profile and company pages",
        icon: "linkedin",
      },
      {
        id: "webflow",
        name: "Webflow",
        authType: "oauth",
        description: "Webflow CMS collections",
        icon: "webflow",
      },
      {
        id: "devto",
        name: "Dev.to",
        authType: "api_key",
        description: "Dev.to developer community",
        icon: "devto",
      },
      {
        id: "ghost",
        name: "Ghost",
        authType: "api_key",
        description: "Ghost CMS",
        icon: "ghost",
      },
      {
        id: "wix",
        name: "Wix",
        authType: "api_key",
        description: "Wix blog",
        icon: "wix",
      },
      {
        id: "squarespace",
        name: "Squarespace",
        authType: "api_key",
        description: "Squarespace blog",
        icon: "squarespace",
      },
      {
        id: "custom",
        name: "Custom CMS",
        authType: "custom",
        description: "Custom webhook-based integration",
        icon: "webhook",
      },
    ];
  },
});
