"use client";

import posthog from "posthog-js";

/**
 * Initialize PostHog for product analytics
 * Call this in a client component on app load
 */
export function initPostHog() {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    !posthog.__loaded
  ) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
    });
  }
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    posthog.identify(userId, traits);
  }
}

/**
 * Track page view
 */
export function trackPageView() {
  if (typeof window !== "undefined") {
    posthog.capture("$pageview");
  }
}
