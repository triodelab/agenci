import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "anonymize-expired-contact-sessions",
  { hourUTC: 2, minuteUTC: 0 },
  internal.system.contactSessions.purgeExpired,
);

crons.interval(
  "schedule-website-syncs",
  { hours: 1 },
  internal.system.websites.scheduleDueRuns,
);

export default crons;
