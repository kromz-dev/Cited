import { NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { db } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check
  const processed = await db.processedWebhook.findUnique({
    where: { id: event.id }
  });

  if (processed) {
    console.log(`Webhook ${event.id} already processed.`);
    return NextResponse.json({ received: true });
  }

  // Mark as processed
  await db.processedWebhook.create({
    data: { id: event.id }
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.client_reference_id) {
          const userId = session.client_reference_id;
          
          await db.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubId: session.subscription as string,
              // Par défaut on passe en PRO si on capte un paiement. Dans la vraie vie,
              // on regarderait l'ID du produit acheté pour définir le Plan.
              plan: "PRO",
            }
          });
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        
        const user = await db.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              stripeSubId: subscription.id,
              // On ajuste le plan ici selon l'état
              plan: subscription.status === "active" ? user.plan : "FREE"
            }
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        
        const user = await db.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              currentPeriodEnd: null,
            }
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // On efface de l'historique pour pouvoir réessayer si ça a crashé pendant le traitement métier
    await db.processedWebhook.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
