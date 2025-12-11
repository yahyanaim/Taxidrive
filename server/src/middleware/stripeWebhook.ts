import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import prisma from '../database/prisma';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Store webhook event in database
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: event.data as any,
      },
    });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;
      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { 
        processed: true,
        processedAt: new Date(),
      },
    });

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { ride: true }
    });

    if (payment) {
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'SUCCEEDED',
          paidAt: new Date(),
        },
      });

      // Update ride status
      if (payment.ride) {
        await prisma.ride.update({
          where: { id: payment.rideId },
          data: { status: 'COMPLETED' },
        });
      }

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: payment.userId,
          rideId: payment.rideId,
          type: 'PAYMENT',
          stripeTransactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents
          status: 'SUCCEEDED',
          description: 'Ride payment',
          metadata: paymentIntent as any,
        },
      });
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
      },
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    // This would typically be handled when a user adds a payment method
    console.log('Payment method attached:', paymentMethod.id);
  } catch (error) {
    console.error('Error handling payment method attached:', error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Update driver account status based on Stripe account updates
    await prisma.driver.updateMany({
      where: { stripeAccountId: account.id },
      data: { 
        isApproved: account.charges_enabled && account.details_submitted 
      },
    });
  } catch (error) {
    console.error('Error handling account updated:', error);
  }
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  try {
    await prisma.payout.updateMany({
      where: { stripePayoutId: payout.id },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling payout paid:', error);
  }
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  try {
    await prisma.payout.updateMany({
      where: { stripePayoutId: payout.id },
      data: {
        status: 'FAILED',
        failureReason: 'Stripe payout failed',
      },
    });
  } catch (error) {
    console.error('Error handling payout failed:', error);
  }
}