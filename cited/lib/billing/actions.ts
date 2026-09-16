"use server";

import { stripe } from "./stripe";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createCheckoutSession(priceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Create checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: user.stripeCustomerId ? undefined : user.email,
    customer: user.stripeCustomerId || undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    client_reference_id: user.id,
  });

  if (!stripeSession.url) {
    throw new Error("Could not create stripe session");
  }

  redirect(stripeSession.url);
}

export async function createCustomerPortalSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No stripe customer found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  redirect(portalSession.url);
}
