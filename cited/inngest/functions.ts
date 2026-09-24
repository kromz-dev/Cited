import { dailyScanJob } from "./functions/daily-scan";
import { scanSiteJob } from "./functions/scan-site";
import { pruneScanLogsJob } from "./functions/prune-scan-logs";
import { discoveryEmailDispatcher, discoveryEmailSender } from "./functions/discovery-email";

export const functions = [
  dailyScanJob,
  scanSiteJob,
  pruneScanLogsJob,
  discoveryEmailDispatcher,
  discoveryEmailSender
];
