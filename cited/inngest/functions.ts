import { dailyScanJob } from "./functions/daily-scan";
import { scanSiteJob } from "./functions/scan-site";

export const functions = [
  dailyScanJob,
  scanSiteJob
];
