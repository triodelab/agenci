import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "anonymize-expired-contact-sessions",
  { hourUTC: 2, minuteUTC: 0 },
  internal.system.contactSessions.purgeExpired,
);

export default crons;
