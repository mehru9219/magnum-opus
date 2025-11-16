import { describe, it, expect, vi } from 'vitest';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
}));

// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    __loaded: false,
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Axiom
vi.mock('next-axiom', () => {
  return {
    Logger: class {
      info() {}
      error() {}
      warn() {}
      debug() {}
    },
  };
});

describe('Monitoring Infrastructure', () => {
  describe('Sentry', () => {
    it('should export Sentry monitoring functions', async () => {
      const { initSentry, captureException, captureMessage, setUser } = await import(
        '@/lib/monitoring/sentry'
      );
      expect(initSentry).toBeDefined();
      expect(captureException).toBeDefined();
      expect(captureMessage).toBeDefined();
      expect(setUser).toBeDefined();
    });
  });

  describe('PostHog', () => {
    it('should export PostHog analytics functions', async () => {
      const { initPostHog, trackEvent, identifyUser, trackPageView } = await import(
        '@/lib/monitoring/posthog'
      );
      expect(initPostHog).toBeDefined();
      expect(trackEvent).toBeDefined();
      expect(identifyUser).toBeDefined();
      expect(trackPageView).toBeDefined();
    });
  });

  describe('Axiom', () => {
    it('should export Axiom logging functions', async () => {
      const { logger, logInfo, logError, logWarn, logDebug } = await import(
        '@/lib/monitoring/axiom'
      );
      expect(logger).toBeDefined();
      expect(logInfo).toBeDefined();
      expect(logError).toBeDefined();
      expect(logWarn).toBeDefined();
      expect(logDebug).toBeDefined();
    });
  });
});
