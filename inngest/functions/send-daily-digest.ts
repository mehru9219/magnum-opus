/**
 * Daily Digest Email Job (Week 5)
 *
 * Sends daily summary email at 9 AM with:
 * - New optimization opportunities
 * - Visibility score changes
 * - Publishing activity
 * - Analytics highlights
 *
 * Personalized per user with actionable insights
 */

import { inngest } from "../client";
import { api } from "../../convex/_generated/api";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Send daily digest email to single user
 */
export const sendDailyDigest = inngest.createFunction(
  {
    id: "send-daily-digest",
    name: "Send Daily Digest Email",
    retries: 2,
  },
  { event: "digest/daily" },
  async ({ event, step, logger }) => {
    const { userId } = event.data;

    logger.info("Preparing daily digest", { userId });

    // Step 1: Fetch user details
    const user = await step.run("fetch-user", async () => {
      const userData = await convex.query(api.users.getUser, { userId });

      if (!userData) {
        throw new Error(`User not found: ${userId}`);
      }

      // Check if user has email notifications enabled
      if (!userData.emailNotifications) {
        logger.info("User has email notifications disabled", { userId });
        return null;
      }

      return userData;
    });

    if (!user) {
      return { success: true, skipped: true, reason: "Email notifications disabled" };
    }

    // Step 2: Gather digest data from last 24 hours
    const digestData = await step.run("gather-digest-data", async () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;

      // Fetch new opportunities
      const newOpportunities = await convex.query(
        api.optimization.getOpportunitiesSince,
        {
          userId,
          since: yesterday,
        }
      );

      // Fetch visibility score changes
      const visibilityChanges = await convex.query(
        api.tracking.getVisibilityChangesSince,
        {
          userId,
          since: yesterday,
        }
      );

      // Fetch publishing activity
      const publishingActivity = await convex.query(
        api.publishing.getPublishingSince,
        {
          userId,
          since: yesterday,
        }
      );

      // Fetch analytics highlights
      const analyticsHighlights = await convex.query(
        api.analytics.getHighlightsSince,
        {
          userId,
          since: yesterday,
        }
      );

      // Fetch generated articles
      const generatedArticles = await convex.query(
        api.articles.getArticlesSince,
        {
          userId,
          since: yesterday,
        }
      );

      logger.info("Digest data gathered", {
        opportunities: newOpportunities.length,
        visibilityChanges: visibilityChanges.length,
        publishingJobs: publishingActivity.length,
        generatedArticles: generatedArticles.length,
      });

      return {
        newOpportunities,
        visibilityChanges,
        publishingActivity,
        analyticsHighlights,
        generatedArticles,
      };
    });

    // Step 3: Check if there's anything to report
    const hasActivity =
      digestData.newOpportunities.length > 0 ||
      digestData.visibilityChanges.length > 0 ||
      digestData.publishingActivity.length > 0 ||
      digestData.generatedArticles.length > 0;

    if (!hasActivity) {
      logger.info("No activity to report - skipping digest", { userId });
      return { success: true, skipped: true, reason: "No activity" };
    }

    // Step 4: Build email content
    const emailContent = await step.run("build-email", async () => {
      logger.info("Building email content");

      try {
        const content = await convex.action(api.email.buildDailyDigest, {
          userId,
          userName: user.name,
          userEmail: user.email,
          data: digestData,
        });

        logger.info("Email content built", {
          subjectLine: content.subject,
          bodyLength: content.html.length,
        });

        return content;
      } catch (error) {
        logger.error("Failed to build email content", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 5: Send email
    const emailResult = await step.run("send-email", async () => {
      logger.info("Sending digest email", {
        to: user.email,
        subject: emailContent.subject,
      });

      try {
        const result = await convex.action(api.email.sendEmail, {
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        logger.info("Email sent successfully", {
          messageId: result.messageId,
        });

        return result;
      } catch (error) {
        logger.error("Failed to send email", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    });

    // Step 6: Record email sent
    await step.run("record-email", async () => {
      await convex.mutation(api.email.recordEmailSent, {
        userId,
        type: "daily-digest",
        recipient: user.email,
        subject: emailContent.subject,
        messageId: emailResult.messageId,
        sentAt: Date.now(),
      });
    });

    logger.info("Daily digest sent successfully", {
      userId,
      email: user.email,
      messageId: emailResult.messageId,
    });

    return {
      success: true,
      skipped: false,
      userId,
      messageId: emailResult.messageId,
      activitySummary: {
        opportunities: digestData.newOpportunities.length,
        visibilityChanges: digestData.visibilityChanges.length,
        publishingJobs: digestData.publishingActivity.length,
        generatedArticles: digestData.generatedArticles.length,
      },
    };
  }
);

/**
 * Daily scheduled digest for all users (cron job)
 */
export const scheduledDailyDigest = inngest.createFunction(
  {
    id: "scheduled-daily-digest",
    name: "Scheduled Daily Digest",
    concurrency: {
      limit: 20, // Send to 20 users at a time
    },
  },
  { cron: "0 9 * * *" }, // 9 AM daily
  async ({ step, logger }) => {
    logger.info("Starting scheduled daily digest for all users");

    // Get all active users with email notifications enabled
    const users = await step.run("fetch-users", async () => {
      const activeUsers = await convex.query(
        api.users.getUsersWithEmailNotifications,
        {}
      );

      logger.info(`Found ${activeUsers.length} users with email notifications enabled`);
      return activeUsers;
    });

    // Send digest to each user
    const results = await Promise.allSettled(
      users.map(async (user: any, index: number) => {
        return step.run(`send-digest-${user._id}`, async () => {
          logger.info(
            `Sending digest ${index + 1}/${users.length}: ${user.email}`
          );

          await step.invoke(`digest-${user._id}`, {
            function: sendDailyDigest,
            data: { userId: user._id },
          });

          return { userId: user._id, success: true };
        });
      })
    );

    const summary = {
      total: users.length,
      sent: results.filter(
        (r) => r.status === "fulfilled" && (r.value as any).success
      ).length,
      skipped: results.filter(
        (r) => r.status === "fulfilled" && (r.value as any).skipped
      ).length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("Scheduled daily digest complete", summary);

    return summary;
  }
);

/**
 * Send instant notification for high-priority events
 */
export const sendInstantNotification = inngest.createFunction(
  {
    id: "send-instant-notification",
    name: "Send Instant Notification",
    retries: 2,
  },
  { event: "notification/instant" },
  async ({ event, step, logger }) => {
    const { userId, type, title, message, actionUrl } = event.data;

    logger.info("Sending instant notification", { userId, type });

    // Fetch user
    const user = await step.run("fetch-user", async () => {
      return convex.query(api.users.getUser, { userId });
    });

    if (!user?.emailNotifications) {
      return { success: true, skipped: true, reason: "Notifications disabled" };
    }

    // Build notification email
    const emailContent = await step.run("build-email", async () => {
      return convex.action(api.email.buildNotificationEmail, {
        userName: user.name,
        type,
        title,
        message,
        actionUrl,
      });
    });

    // Send email
    const result = await step.run("send-email", async () => {
      return convex.action(api.email.sendEmail, {
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    });

    // Record notification
    await step.run("record-notification", async () => {
      await convex.mutation(api.email.recordEmailSent, {
        userId,
        type: `instant-${type}`,
        recipient: user.email,
        subject: emailContent.subject,
        messageId: result.messageId,
        sentAt: Date.now(),
      });
    });

    logger.info("Instant notification sent", {
      userId,
      type,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  }
);

/**
 * Send weekly summary email
 */
export const sendWeeklySummary = inngest.createFunction(
  {
    id: "send-weekly-summary",
    name: "Send Weekly Summary",
    concurrency: {
      limit: 10,
    },
  },
  { cron: "0 9 * * 1" }, // Monday at 9 AM
  async ({ step, logger }) => {
    logger.info("Starting weekly summary for all users");

    const users = await step.run("fetch-users", async () => {
      return convex.query(api.users.getUsersWithEmailNotifications, {});
    });

    const results = await Promise.allSettled(
      users.map(async (user: any) => {
        return step.run(`weekly-${user._id}`, async () => {
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

          // Gather weekly data
          const weeklyData = {
            articlesGenerated: await convex.query(
              api.articles.countArticlesSince,
              { userId: user._id, since: weekAgo }
            ),
            articlesPublished: await convex.query(
              api.publishing.countPublishedSince,
              { userId: user._id, since: weekAgo }
            ),
            visibilityTrend: await convex.query(
              api.tracking.getVisibilityTrend,
              { userId: user._id, days: 7 }
            ),
            topOpportunities: await convex.query(
              api.optimization.getTopOpportunities,
              { userId: user._id, limit: 5 }
            ),
          };

          // Build and send email
          const emailContent = await convex.action(api.email.buildWeeklySummary, {
            userName: user.name,
            data: weeklyData,
          });

          const result = await convex.action(api.email.sendEmail, {
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });

          return { userId: user._id, success: true };
        });
      })
    );

    const summary = {
      total: users.length,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    logger.info("Weekly summary complete", summary);

    return summary;
  }
);
