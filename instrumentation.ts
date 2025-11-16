/**
 * Next.js Instrumentation
 * Used to initialize monitoring and observability tools
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentry } = await import("./lib/monitoring/sentry");
    initSentry();
  }
}
