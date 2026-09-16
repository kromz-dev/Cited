"use server";

import { db } from "@/lib/db";
import { sendAuditReportEmail } from "@/lib/email/resend";
import { z } from "zod";

const leadSchema = z.object({
  email: z.string().email(),
  domain: z.string().min(3),
  brandName: z.string().min(1),
  score: z.number().min(0).max(100),
  mentionsCount: z.number().min(0).max(50), // Un peu de marge au cas où on augmente le max
  totalRuns: z.number().min(0).max(50),
  competitorMentions: z.array(z.object({
    name: z.string(),
    count: z.number().min(0)
  })).max(20)
});

export async function captureLead(formData: FormData, auditDataStr: string) {
  try {
    const email = formData.get("email") as string;
    const auditData = JSON.parse(auditDataStr);
    
    // Validate inputs
    const parsed = leadSchema.parse({
      email,
      ...auditData
    });

    // Save lead to DB
    await db.auditLead.upsert({
      where: {
        email_domain: {
          email: parsed.email,
          domain: parsed.domain
        }
      },
      update: {
        score: parsed.score,
        brandName: parsed.brandName,
        createdAt: new Date()
      },
      create: {
        email: parsed.email,
        domain: parsed.domain,
        brandName: parsed.brandName,
        score: parsed.score
      }
    });

    // Send email
    await sendAuditReportEmail(parsed.email, {
      brandName: parsed.brandName,
      domain: parsed.domain,
      score: parsed.score,
      mentionsCount: parsed.mentionsCount,
      totalRuns: parsed.totalRuns,
      competitorMentions: parsed.competitorMentions
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to capture lead", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}
