import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is missing. Stripe calls will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  appInfo: {
    name: "Cited",
    version: "0.1.0",
  },
});
