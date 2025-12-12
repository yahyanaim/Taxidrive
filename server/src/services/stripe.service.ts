import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  static async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
    });
  }

  static async createConnectAccount(email: string): Promise<Stripe.Account> {
    return await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  static async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  static async capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.capture(paymentIntentId);
  }

  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundData.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    return await stripe.refunds.create(refundData);
  }

  static async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  static async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }

  static async createPayout(
    amount: number,
    currency: string,
    destination: string
  ): Promise<Stripe.Payout> {
    return await stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency,
        method: 'instant',
      },
      {
        stripeAccount: destination,
      }
    );
  }

  static async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<Stripe.AccountLink> {
    return await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });
  }

  static async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    return await stripe.accounts.retrieve(accountId);
  }

  static async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    endpointSecret: string
  ): Promise<Stripe.Event> {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  }
}

export default StripeService;