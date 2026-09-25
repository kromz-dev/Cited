"use server";

import { auth } from "@/auth";
import { ReportPeriod, getMonthlyReportDataForUser, generateMonthlyReportForUser } from "@/lib/reports/monthlyReport";

export async function getMonthlyReportData(clientId: string, period: ReportPeriod) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (
      !clientId ||
      !(period.start instanceof Date) ||
      !(period.end instanceof Date) ||
      period.start.getTime() > period.end.getTime()
    ) {
      return { error: "Requête invalide" };
    }

    return await getMonthlyReportDataForUser(userId, clientId, period);
  } catch {
    return { error: "Internal server error" };
  }
}

export async function generateMonthlyReport(clientId: string, period: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (!clientId || typeof period !== "string" || !period.match(/^\d{4}-\d{2}$/)) {
      return { error: "Requête invalide" };
    }

    return await generateMonthlyReportForUser(userId, clientId, period);
  } catch {
    return { error: "Internal server error" };
  }
}
