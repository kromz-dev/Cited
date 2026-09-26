import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing. Please set it in your .env file.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Must match the API version pinned by the installed `stripe` package (see
  // its CHANGELOG). Bump this alongside any `stripe` package upgrade.
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});
