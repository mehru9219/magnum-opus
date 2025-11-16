/**
 * Scheduled Publishing Job (Week 2)
 *
 * Executes publishing at configured times:
 * - Cron-based scheduling (e.g., daily at 9 AM, weekly on Monday)
 * - User-specified future dates/times
 * - Timezone-aware scheduling
 * - Automatic retry if publishing fails
 *
 * Integrates with calendar view for content planning
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";
import { publishToPlatforms } from "./publish-to-platforms";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Execute scheduled publish job
 */
export const executeScheduledPublish = inngest.createFunction(
  {
    id: "execute-scheduled-publish",
    name: "Execute Scheduled Publish",
    retries: 2,
  },
  { event: "publish/scheduled" },
  async ({ event, step, logger }) => {
    const { publishJobId, userId } = event.data;

    logger.info(`Executing scheduled publish job: ${publishJobId}`);

    // Step 1: Fetch publish job details
    const publishJob = await step.run("fetch-publish-job", async () => {
      const job = await convex.query(api.publishing.getPublishJob, {
        publishJobId,
        userId,
      });

      if (!job) {
        throw new Error(`Publish job not found: ${publishJobId}`);
      }

      return job;
    });

    // Step 2: Verify it's time to publish
    const shouldPublish = await step.run("verify-timing", async () => {
      const now = Date.now();
      const scheduledTime = publishJob.scheduledFor;

      // Allow execution within ±5 minutes of scheduled time
      const fiveMinutes = 5 * 60 * 1000;
      const isWithinWindow =
        now >= scheduledTime - fiveMinutes &&
        now <= scheduledTime + fiveMinutes;

      if (!isWithinWindow) {
        logger.warn("Outside scheduled time window", {
          scheduledTime,
          now,
          difference: now - scheduledTime,
        });
      }

      return isWithinWindow;
    });

    if (!shouldPublish) {
      logger.warn("Skipping execution - outside time window", { publishJobId });
      return { success: false, reason: "Outside time window" };
    }

    // Step 3: Update job status
    await step.run("update-status", async () => {
      await convex.mutation(api.publishing.updatePublishJob, {
        publishJobId,
        status: "executing",
        executedAt: Date.now(),
      });
    });

    // Step 4: Trigger publishing
    const result = await step.invoke("publish", {
      function: publishToPlatforms,
      data: {
        articleId: publishJob.articleId,
        userId,
        platformIds: publishJob.platformIds,
      },
    });

    logger.info("Scheduled publish complete", {
      publishJobId,
      result,
    });

    return {
      success: true,
      publishJobId,
      result,
    };
  }
);

/**
 * Schedule future publish job
 * Creates a delayed event that triggers at the specified time
 */
export const schedulePublish = inngest.createFunction(
  {
    id: "schedule-publish",
    name: "Schedule Future Publish",
  },
  { event: "publish/schedule" },
  async ({ event, step, logger }) => {
    const { articleId, userId, platformIds, scheduledFor, timezone } =
      event.data;

    logger.info("Scheduling future publish", {
      articleId,
      scheduledFor: new Date(scheduledFor).toISOString(),
      timezone,
    });

    // Step 1: Create publish job record
    const publishJobId = await step.run("create-job", async () => {
      const jobId = await convex.mutation(api.publishing.createPublishJob, {
        articleId,
        userId,
        platformIds,
        status: "scheduled",
        scheduledFor,
        timezone,
      });

      logger.info("Publish job scheduled", { publishJobId: jobId });
      return jobId;
    });

    // Step 2: Schedule execution event
    await step.run("schedule-event", async () => {
      const delay = scheduledFor - Date.now();

      // Schedule event to trigger at specified time
      await inngest.send({
        name: "publish/scheduled",
        data: { publishJobId, userId },
        ts: scheduledFor, // Inngest will trigger at this timestamp
      });

      logger.info("Scheduled event created", {
        publishJobId,
        delayMs: delay,
        triggersAt: new Date(scheduledFor).toISOString(),
      });
    });

    return {
      success: true,
      publishJobId,
      scheduledFor,
    };
  }
);

/**
 * Cancel scheduled publish
 */
export const cancelScheduledPublish = inngest.createFunction(
  {
    id: "cancel-scheduled-publish",
    name: "Cancel Scheduled Publish",
  },
  { event: "publish/cancel-schedule" },
  async ({ event, step, logger }) => {
    const { publishJobId, userId } = event.data;

    logger.info("Canceling scheduled publish", { publishJobId });

    await step.run("cancel", async () => {
      await convex.mutation(api.publishing.updatePublishJob, {
        publishJobId,
        status: "cancelled",
        cancelledAt: Date.now(),
      });
    });

    logger.info("Scheduled publish cancelled", { publishJobId });

    return { success: true, publishJobId };
  }
);

/**
 * Reschedule publish job
 */
export const reschedulePublish = inngest.createFunction(
  {
    id: "reschedule-publish",
    name: "Reschedule Publish",
  },
  { event: "publish/reschedule" },
  async ({ event, step, logger }) => {
    const { publishJobId, userId, newScheduledFor } = event.data;

    logger.info("Rescheduling publish", {
      publishJobId,
      newScheduledFor: new Date(newScheduledFor).toISOString(),
    });

    // Cancel old schedule
    await step.invoke("cancel-old", {
      function: cancelScheduledPublish,
      data: { publishJobId, userId },
    });

    // Get job details
    const job = await step.run("get-job", async () => {
      return convex.query(api.publishing.getPublishJob, {
        publishJobId,
        userId,
      });
    });

    // Create new schedule
    const newJobId = await step.invoke("create-new", {
      function: schedulePublish,
      data: {
        articleId: job.articleId,
        userId,
        platformIds: job.platformIds,
        scheduledFor: newScheduledFor,
        timezone: job.timezone,
      },
    });

    logger.info("Publish rescheduled", {
      oldJobId: publishJobId,
      newJobId,
    });

    return {
      success: true,
      oldJobId: publishJobId,
      newJobId,
    };
  }
);

/**
 * Recurring publish scheduler (e.g., weekly blog posts)
 */
export const setupRecurringPublish = inngest.createFunction(
  {
    id: "setup-recurring-publish",
    name: "Setup Recurring Publish",
  },
  { event: "publish/recurring-setup" },
  async ({ event, step, logger }) => {
    const { userId, articleId, platformIds, recurrence, timezone } = event.data;

    logger.info("Setting up recurring publish", {
      articleId,
      recurrence,
    });

    // Create recurring schedule record
    const scheduleId = await step.run("create-schedule", async () => {
      return convex.mutation(api.publishing.createRecurringSchedule, {
        userId,
        articleId,
        platformIds,
        recurrence, // "daily", "weekly", "monthly"
        timezone,
        isActive: true,
      });
    });

    logger.info("Recurring publish schedule created", { scheduleId });

    return {
      success: true,
      scheduleId,
    };
  }
);
