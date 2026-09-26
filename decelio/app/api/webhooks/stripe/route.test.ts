import { describe, it, expect, vi, beforeEach } from "vitest";

// `webhookSecret` est lu au chargement du module (comme dans route.ts) : les
// variables d'environnement doivent donc être posées avant l'import dynamique
// de la route, un import statique arriverait trop tard.
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
process.env.STRIPE_FOUNDER_COUPON = "FONDATEUR50";

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: vi.fn(),
}));

vi.mock("@/lib/billing/plans", () => ({
  planForPriceId: vi.fn(() => "SOLO"),
}));

const txUserUpdate = vi.fn();
const txProcessedWebhookCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback({
        processedWebhook: { create: txProcessedWebhookCreate },
        user: { update: txUserUpdate },
      }),
    ),
  },
}));

import { getStripe } from "@/lib/billing/stripe";

const { POST } = await import("./route");

function fakeRequest() {
  return new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "sig_test" },
    body: "{}",
  });
}

function fakeSubscription() {
  return {
    id: "sub_1",
    items: {
      data: [
        {
          price: { id: "price_solo" },
          current_period_end: 1_700_000_000,
        },
      ],
    },
  };
}

function fakeSession(discounts: Array<{ coupon: string | { id: string } | null }> | null) {
  return {
    client_reference_id: "user-1",
    customer: "cus_1",
    subscription: "sub_1",
    discounts,
  };
}

function mockStripe(session: ReturnType<typeof fakeSession>) {
  const event = {
    id: "evt_1",
    type: "checkout.session.completed",
    data: { object: session },
  };

  vi.mocked(getStripe).mockReturnValue({
    webhooks: { constructEvent: vi.fn(() => event) },
    subscriptions: { retrieve: vi.fn(async () => fakeSubscription()) },
  } as unknown as ReturnType<typeof getStripe>);
}

describe("POST /api/webhooks/stripe — checkout.session.completed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks the user as founder member when the founder coupon was applied", async () => {
    mockStripe(fakeSession([{ coupon: "FONDATEUR50" }]));

    const res = await POST(fakeRequest());

    expect(res.status).toBe(200);
    expect(txUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          isFounderMember: true,
          founderOfferAt: expect.any(Date),
        }),
      }),
    );
  });

  it("does not touch founder fields when no coupon was applied", async () => {
    mockStripe(fakeSession([]));

    const res = await POST(fakeRequest());

    expect(res.status).toBe(200);
    expect(txUserUpdate).toHaveBeenCalledTimes(1);
    const data = txUserUpdate.mock.calls[0][0].data;
    expect(data.isFounderMember).toBeUndefined();
    expect(data.founderOfferAt).toBeUndefined();
  });

  it("does not touch founder fields when a different coupon was applied", async () => {
    mockStripe(fakeSession([{ coupon: "AUTRE_COUPON" }]));

    const res = await POST(fakeRequest());

    expect(res.status).toBe(200);
    const data = txUserUpdate.mock.calls[0][0].data;
    expect(data.isFounderMember).toBeUndefined();
    expect(data.founderOfferAt).toBeUndefined();
  });
});
