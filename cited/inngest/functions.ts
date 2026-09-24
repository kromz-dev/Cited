import { dailyScanJob } from "./functions/daily-scan";
import { scanSiteJob } from "./functions/scan-site";
import { discoveryEmailDispatcher, discoveryEmailSender } from "./functions/discovery-email";

export const functions = [
  dailyScanJob,
  scanSiteJob,
  discoveryEmailDispatcher,
  discoveryEmailSender
];
