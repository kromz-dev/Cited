import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing. Please set it in your .env file.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28.acacia", // Use appropriate stable API version or let it default if necessary. We use the latest stable commonly. Note the exact version is fine as long as we pass it. I will use the latest version string format from stripe.
  typescript: true,
});
