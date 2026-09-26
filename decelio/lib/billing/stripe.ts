import Stripe from "stripe";

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for billing operations.");
  }

  return new Stripe(secretKey, {
    appInfo: {
      name: "Decelio",
      version: "0.1.0",
    },
  });
}
