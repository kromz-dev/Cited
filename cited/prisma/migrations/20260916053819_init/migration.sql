-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'PRO', 'SCALE');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('WEEKLY', 'TWICE_WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "PromptFamily" AS ENUM ('PROBLEM', 'SOLUTION', 'COMPARISON', 'DISCOVERY', 'BRAND');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'RUNNING', 'RETRYING', 'DONE', 'FAILED', 'UNPARSEABLE');

-- CreateEnum
CREATE TYPE "EngineId" AS ENUM ('GROQ', 'GEMINI', 'CHATGPT', 'PERPLEXITY', 'GOOGLE_AIO', 'CLAUDE');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Effort" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CorrectionType" AS ENUM ('CONTENT', 'JSONLD', 'LLMS_TXT', 'BACKLINK', 'LISTING');

-- CreateEnum
CREATE TYPE "ApiPurpose" AS ENUM ('CAMPAIGN_QUERY', 'BRAND_DETECTION', 'PROMPT_GENERATION', 'MENTION_ANALYSIS', 'RECOMMENDATION', 'CORRECTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "purgeAt" TIMESTAMP(3),
    "dataExportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandAliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industry" TEXT,
    "country" TEXT NOT NULL DEFAULT 'FR',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "frequency" "Frequency" NOT NULL DEFAULT 'WEEKLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groundTruth" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "family" "PromptFamily" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'QUEUED',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "enginesUsed" "EngineId"[],
    "repetitions" INTEGER NOT NULL DEFAULT 1,
    "tasksTotal" INTEGER NOT NULL DEFAULT 0,
    "tasksDone" INTEGER NOT NULL DEFAULT 0,
    "tasksFailed" INTEGER NOT NULL DEFAULT 0,
    "visibilityScore" DOUBLE PRECISION,
    "shareOfVoice" DOUBLE PRECISION,
    "scoreMarginOfError" DOUBLE PRECISION,
    "totalCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "engine" "EngineId" NOT NULL,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "promptText" TEXT NOT NULL,
    "promptVersion" INTEGER NOT NULL DEFAULT 1,
    "modelVersion" TEXT,
    "rawResponse" TEXT,
    "brandMentioned" BOOLEAN NOT NULL DEFAULT false,
    "brandPosition" INTEGER,
    "sentiment" "Sentiment",
    "snippet" TEXT,
    "claimsGenerated" INTEGER,
    "claimsCorrect" INTEGER,
    "hallucinations" BOOLEAN,
    "positionScore" DOUBLE PRECISION,
    "entitySalience" DOUBLE PRECISION,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "fromCache" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "claimedAt" TIMESTAMP(3),
    "leaseUntil" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "title" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorMention" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "position" INTEGER,

    CONSTRAINT "CompetitorMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "finding" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "effort" "Effort" NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Correction" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "CorrectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "targetUrl" TEXT,
    "targetQuery" TEXT,
    "content" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Correction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineCache" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "engine" "EngineId" NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "family" "PromptFamily",
    "rawResponse" TEXT NOT NULL,
    "citations" JSONB NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "sourceBrandId" TEXT,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiCall" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "brandId" TEXT,
    "runId" TEXT,
    "engine" "EngineId" NOT NULL,
    "purpose" "ApiPurpose" NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "fromCache" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageCounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "runsUsed" INTEGER NOT NULL DEFAULT 0,
    "billedCalls" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedWebhook" (
    "id" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubId_key" ON "User"("stripeSubId");

-- CreateIndex
CREATE INDEX "User_purgeAt_idx" ON "User"("purgeAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Brand_userId_idx" ON "Brand"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_id_userId_key" ON "Brand"("id", "userId");

-- CreateIndex
CREATE INDEX "Competitor_brandId_idx" ON "Competitor"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_id_brandId_key" ON "Competitor"("id", "brandId");

-- CreateIndex
CREATE INDEX "Prompt_brandId_isActive_deletedAt_idx" ON "Prompt"("brandId", "isActive", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_id_brandId_key" ON "Prompt"("id", "brandId");

-- CreateIndex
CREATE INDEX "Campaign_brandId_startedAt_idx" ON "Campaign"("brandId", "startedAt");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_brandId_scheduledFor_key" ON "Campaign"("brandId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_id_brandId_key" ON "Campaign"("id", "brandId");

-- CreateIndex
CREATE INDEX "Run_campaignId_status_idx" ON "Run"("campaignId", "status");

-- CreateIndex
CREATE INDEX "Run_brandId_createdAt_idx" ON "Run"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "Run_status_nextAttemptAt_idx" ON "Run"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "Run_status_leaseUntil_idx" ON "Run"("status", "leaseUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Run_campaignId_promptId_engine_repetition_key" ON "Run"("campaignId", "promptId", "engine", "repetition");

-- CreateIndex
CREATE INDEX "Citation_runId_idx" ON "Citation"("runId");

-- CreateIndex
CREATE INDEX "Citation_brandId_domain_idx" ON "Citation"("brandId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "Citation_runId_url_key" ON "Citation"("runId", "url");

-- CreateIndex
CREATE INDEX "CompetitorMention_runId_idx" ON "CompetitorMention"("runId");

-- CreateIndex
CREATE INDEX "CompetitorMention_competitorId_idx" ON "CompetitorMention"("competitorId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorMention_runId_competitorId_key" ON "CompetitorMention"("runId", "competitorId");

-- CreateIndex
CREATE INDEX "Recommendation_campaignId_idx" ON "Recommendation"("campaignId");

-- CreateIndex
CREATE INDEX "Correction_campaignId_idx" ON "Correction"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "EngineCache_fingerprint_key" ON "EngineCache"("fingerprint");

-- CreateIndex
CREATE INDEX "EngineCache_expiresAt_idx" ON "EngineCache"("expiresAt");

-- CreateIndex
CREATE INDEX "EngineCache_engine_createdAt_idx" ON "EngineCache"("engine", "createdAt");

-- CreateIndex
CREATE INDEX "ApiCall_userId_createdAt_idx" ON "ApiCall"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiCall_engine_createdAt_idx" ON "ApiCall"("engine", "createdAt");

-- CreateIndex
CREATE INDEX "UsageCounter_userId_idx" ON "UsageCounter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageCounter_userId_periodStart_key" ON "UsageCounter"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "AuditLead_createdAt_idx" ON "AuditLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLead_email_domain_key" ON "AuditLead"("email", "domain");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_userId_fkey" FOREIGN KEY ("brandId", "userId") REFERENCES "Brand"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_campaignId_brandId_fkey" FOREIGN KEY ("campaignId", "brandId") REFERENCES "Campaign"("id", "brandId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_promptId_brandId_fkey" FOREIGN KEY ("promptId", "brandId") REFERENCES "Prompt"("id", "brandId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorMention" ADD CONSTRAINT "CompetitorMention_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorMention" ADD CONSTRAINT "CompetitorMention_competitorId_brandId_fkey" FOREIGN KEY ("competitorId", "brandId") REFERENCES "Competitor"("id", "brandId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correction" ADD CONSTRAINT "Correction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiCall" ADD CONSTRAINT "ApiCall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
