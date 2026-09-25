-- Corrective migration: the "V3 - Scanner et Pre-rendu" domain (Site, Page,
-- BotScan, ScanResult, MonitoredSite, ScanLog, PageView) was introduced in
-- production via `prisma db push`, so it was never captured by a migration.
-- The 20260924040100_mvp_entities migration already assumes MonitoredSite
-- and ScanLog exist (it ALTERs them and adds a foreign key to
-- MonitoredSite), which is why `prisma migrate deploy` fails on a blank
-- database with `relation "MonitoredSite" does not exist` (P3018 / 42P01).
--
-- Every statement here is written to be a no-op on a database that already
-- has these objects (Neon, provisioned via db push) and to fully create
-- them on a blank database (CI). No data is read or destroyed.

-- CreateTable
CREATE TABLE IF NOT EXISTS "Site" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BotScan" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "botName" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ScanResult" (
    "id" TEXT NOT NULL,
    "botScanId" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "hasJsError" BOOLEAN NOT NULL DEFAULT false,
    "isHtmlEmpty" BOOLEAN NOT NULL DEFAULT false,
    "rawHtml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MonitoredSite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoredSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ScanLog" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "httpStatus" INTEGER NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Site_id_userId_key" ON "Site"("id", "userId");
CREATE INDEX IF NOT EXISTS "Site_userId_idx" ON "Site"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "Page_siteId_path_key" ON "Page"("siteId", "path");
CREATE INDEX IF NOT EXISTS "Page_siteId_idx" ON "Page"("siteId");

CREATE INDEX IF NOT EXISTS "BotScan_pageId_idx" ON "BotScan"("pageId");

CREATE UNIQUE INDEX IF NOT EXISTS "ScanResult_botScanId_key" ON "ScanResult"("botScanId");

CREATE INDEX IF NOT EXISTS "MonitoredSite_userId_idx" ON "MonitoredSite"("userId");
CREATE INDEX IF NOT EXISTS "MonitoredSite_status_createdAt_idx" ON "MonitoredSite"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "ScanLog_siteId_createdAt_idx" ON "ScanLog"("siteId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt" DESC);

-- AddForeignKey (guarded: Postgres has no ADD CONSTRAINT IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Site_userId_fkey'
    ) THEN
        ALTER TABLE "Site" ADD CONSTRAINT "Site_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Page_siteId_fkey'
    ) THEN
        ALTER TABLE "Page" ADD CONSTRAINT "Page_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BotScan_pageId_fkey'
    ) THEN
        ALTER TABLE "BotScan" ADD CONSTRAINT "BotScan_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ScanResult_botScanId_fkey'
    ) THEN
        ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_botScanId_fkey" FOREIGN KEY ("botScanId") REFERENCES "BotScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'MonitoredSite_userId_fkey'
    ) THEN
        ALTER TABLE "MonitoredSite" ADD CONSTRAINT "MonitoredSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ScanLog_siteId_fkey'
    ) THEN
        ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "MonitoredSite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
