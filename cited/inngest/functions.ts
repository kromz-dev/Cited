import { dailyScanJob } from "./functions/daily-scan";
import { scanSiteJob } from "./functions/scan-site";
import { pruneScanLogsJob } from "./functions/prune-scan-logs";

export const functions = [
  dailyScanJob,
  scanSiteJob,
  pruneScanLogsJob
];
