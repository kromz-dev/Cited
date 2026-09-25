-- Migration de rattrapage : supprime le modèle "visibilité de marque" abandonné.
--
-- Le produit a pivoté vers la surveillance de sites (Site/Page/BotScan/MonitoredSite,
-- voir migration 20260924040100_mvp_entities) avant que le modèle initial de suivi
-- de visibilité de marque dans les IA (Brand/Campaign/Prompt/Run/Citation/...) ne
-- soit jamais utilisé en production. `prisma/schema.prisma` ne le déclare plus depuis
-- ce pivot (voir PROGRESS.md §1 et docs/decisions/), mais la migration "init" du
-- 16/09 continuait de le créer : cette migration referme l'écart constaté par la CI
-- (`prisma migrate diff`) entre les migrations appliquées et le schéma actuel.

-- ---------------------------------------------------------------------------
-- 1. Suppression des tables du modèle "visibilité de marque" abandonné.
--    CASCADE supprime au passage leurs clés étrangères et index dépendants ;
--    l'ordre (enfants avant parents) est indiqué pour la lisibilité seulement.
-- ---------------------------------------------------------------------------

-- DropTable
DROP TABLE "CompetitorMention" CASCADE;

-- DropTable
DROP TABLE "Citation" CASCADE;

-- DropTable
DROP TABLE "Recommendation" CASCADE;

-- DropTable
DROP TABLE "Correction" CASCADE;

-- DropTable
DROP TABLE "Run" CASCADE;

-- DropTable
DROP TABLE "Campaign" CASCADE;

-- DropTable
DROP TABLE "Prompt" CASCADE;

-- DropTable
DROP TABLE "Competitor" CASCADE;

-- DropTable
DROP TABLE "Brand" CASCADE;

-- DropTable
DROP TABLE "ApiCall" CASCADE;

-- DropTable
DROP TABLE "UsageCounter" CASCADE;

-- DropTable
DROP TABLE "EngineCache" CASCADE;

-- ---------------------------------------------------------------------------
-- 2. "User" : "plan" passe de l'enum "Plan" à du texte libre (conserve la
--    valeur de chaque ligne existante via un cast explicite).
-- ---------------------------------------------------------------------------

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "plan" TYPE TEXT USING "plan"::text;
ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'FREE';

-- ---------------------------------------------------------------------------
-- 3. "User" : colonnes Stripe renommées pour clarifier leur usage (au lieu
--    d'un drop+add qui aurait perdu les valeurs existantes), plus la
--    nouvelle colonne "stripePriceId".
-- ---------------------------------------------------------------------------

-- RenameColumn (conserve les données existantes)
ALTER TABLE "User" RENAME COLUMN "stripeSubId" TO "stripeSubscriptionId";

-- RenameIndex (suit le renommage de colonne ci-dessus)
ALTER INDEX "User_stripeSubId_key" RENAME TO "User_stripeSubscriptionId_key";

-- RenameColumn (conserve les données existantes)
ALTER TABLE "User" RENAME COLUMN "currentPeriodEnd" TO "stripeCurrentPeriodEnd";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripePriceId" TEXT;

-- ---------------------------------------------------------------------------
-- 4. Suppression des enums devenus inutilisés, une fois qu'aucune colonne
--    ne les référence plus (tables supprimées à l'étape 1, "plan" converti
--    à l'étape 2).
-- ---------------------------------------------------------------------------

-- DropEnum
DROP TYPE "Frequency";

-- DropEnum
DROP TYPE "PromptFamily";

-- DropEnum
DROP TYPE "CampaignStatus";

-- DropEnum
DROP TYPE "RunStatus";

-- DropEnum
DROP TYPE "EngineId";

-- DropEnum
DROP TYPE "Sentiment";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "Effort";

-- DropEnum
DROP TYPE "CorrectionType";

-- DropEnum
DROP TYPE "ApiPurpose";

-- DropEnum
DROP TYPE "Plan";
