import { describe, expect, it } from "vitest";
import { ONBOARDING_PLANS, shouldSkipPlanStep } from "./onboarding-plan";

describe("ONBOARDING_PLANS", () => {
  it("lists the three purchasable plans with names and prices matching /pricing", () => {
    expect(ONBOARDING_PLANS.map((p) => p.id)).toEqual(["SOLO", "PRO", "SCALE"]);

    const solo = ONBOARDING_PLANS.find((p) => p.id === "SOLO")!;
    expect(solo.name).toBe("Freelance");
    expect(solo.price).toBe("39 €");
    expect(solo.maxSites).toBe(10);

    const pro = ONBOARDING_PLANS.find((p) => p.id === "PRO")!;
    expect(pro.name).toBe("Agence");
    expect(pro.price).toBe("99 €");
    expect(pro.maxSites).toBe(30);

    const scale = ONBOARDING_PLANS.find((p) => p.id === "SCALE")!;
    expect(scale.name).toBe("Studio");
    expect(scale.price).toBe("249 €");
    expect(scale.maxSites).toBe(100);
  });

  it("gives each plan a CTA label naming what happens on click", () => {
    for (const plan of ONBOARDING_PLANS) {
      expect(plan.ctaLabel).toBe(`Choisir ${plan.name} : paiement sur Stripe`);
    }
  });
});

describe("shouldSkipPlanStep", () => {
  const now = new Date("2026-09-25T00:00:00Z");

  it("does not skip for a FREE account, even with a future period end", () => {
    const skip = shouldSkipPlanStep(
      { plan: "FREE", stripeCurrentPeriodEnd: new Date("2026-10-25T00:00:00Z") },
      now
    );
    expect(skip).toBe(false);
  });

  it("does not skip for a paid plan with no period end on record", () => {
    const skip = shouldSkipPlanStep({ plan: "SOLO", stripeCurrentPeriodEnd: null }, now);
    expect(skip).toBe(false);
  });

  it("does not skip for a paid plan whose period already ended (lapsed subscription)", () => {
    const skip = shouldSkipPlanStep(
      { plan: "SOLO", stripeCurrentPeriodEnd: new Date("2026-09-01T00:00:00Z") },
      now
    );
    expect(skip).toBe(false);
  });

  it("skips for a paid plan with a period end still in the future", () => {
    const skip = shouldSkipPlanStep(
      { plan: "PRO", stripeCurrentPeriodEnd: new Date("2026-10-25T00:00:00Z") },
      now
    );
    expect(skip).toBe(true);
  });
});
