import { Router } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { StripeService } from '../services/stripe.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = Router();

// Add payment method
router.post('/payment-methods', authMiddleware, asyncHandler(async (req: any, res) => {
  const { paymentMethodId } = req.body;

  if (!paymentMethodId) {
    return res.status(400).json({
      success: false,
      message: 'Payment method ID required',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user?.stripeCustomerId) {
    return res.status(400).json({
      success: false,
      message: 'User does not have a Stripe customer ID',
    });
  }

  try {
    // Attach payment method to customer
    const paymentMethod = await StripeService.attachPaymentMethod(
      paymentMethodId,
      user.stripeCustomerId
    );

    // Check if this is the first payment method
    const existingMethods = await prisma.paymentMethod.findMany({
      where: { userId: req.user.id },
    });

    const isDefault = existingMethods.length === 0;

    // Store payment method in database
    const savedPaymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: req.user.id,
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      data: { paymentMethod: savedPaymentMethod },
      message: 'Payment method added successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add payment method',
    });
  }
}));

// Get user's payment methods
router.get('/payment-methods', authMiddleware, asyncHandler(async (req: any, res) => {
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { userId: req.user.id },
    orderBy: { isDefault: 'desc' },
  });

  res.json({
    success: true,
    data: { paymentMethods },
  });
}));

// Delete payment method
router.delete('/payment-methods/:id', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
  });

  if (!paymentMethod || paymentMethod.userId !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: 'Payment method not found',
    });
  }

  // Delete from Stripe
  try {
    await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
  } catch (error) {
    console.error('Failed to detach payment method from Stripe:', error);
  }

  await prisma.paymentMethod.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Payment method deleted successfully',
  });
}));

// Set default payment method
router.patch('/payment-methods/:id/default', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id },
  });

  if (!paymentMethod || paymentMethod.userId !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: 'Payment method not found',
    });
  }

  // Update all payment methods to not be default
  await prisma.paymentMethod.updateMany({
    where: { userId: req.user.id },
    data: { isDefault: false },
  });

  // Set the selected payment method as default
  const updatedPaymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: { isDefault: true },
  });

  res.json({
    success: true,
    data: { paymentMethod: updatedPaymentMethod },
    message: 'Default payment method updated',
  });
}));

// Confirm payment intent for ride
router.post('/confirm-payment', authMiddleware, asyncHandler(async (req: any, res) => {
  const { rideId, paymentMethodId } = req.body;

  if (!rideId || !paymentMethodId) {
    return res.status(400).json({
      success: false,
      message: 'Ride ID and payment method ID required',
    });
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { payment: true },
  });

  if (!ride || ride.userId !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found',
    });
  }

  if (!ride.paymentIntentId || !ride.payment) {
    return res.status(400).json({
      success: false,
      message: 'Ride does not have a payment intent',
    });
  }

  try {
    // Confirm the payment with Stripe
    const confirmedPaymentIntent = await StripeService.confirmPaymentIntent(
      ride.paymentIntentId,
      paymentMethodId
    );

    // Update payment status
    await prisma.payment.update({
      where: { rideId: rideId },
      data: {
        status: confirmedPaymentIntent.status === 'succeeded' ? 'SUCCEEDED' : 'PROCESSING',
      },
    });

    // Update ride status to ASSIGNED if payment is processing
    if (confirmedPaymentIntent.status === 'processing') {
      await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'ASSIGNED' },
      });
    }

    res.json({
      success: true,
      data: {
        paymentIntent: confirmedPaymentIntent,
      },
      message: 'Payment confirmed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payment confirmation failed',
    });
  }
}));

// Get payment history for user
router.get('/history', authMiddleware, asyncHandler(async (req: any, res) => {
  const { 
    page = 1, 
    limit = 20,
    type,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = { userId: req.user.id };
  
  if (type) {
    where.type = type;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            dropoffAddress: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// Refund payment (admin only)
router.post('/refund', adminMiddleware, asyncHandler(async (req, res) => {
  const { rideId, amount, reason } = req.body;

  if (!rideId) {
    return res.status(400).json({
      success: false,
      message: 'Ride ID required',
    });
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { payment: true },
  });

  if (!ride || !ride.payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  try {
    // Process refund with Stripe
    const refund = await StripeService.refundPayment(
      ride.payment.stripePaymentIntentId,
      amount,
      reason
    );

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { rideId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount: amount || ride.payment.amount,
      },
    });

    // Create refund transaction record
    await prisma.transaction.create({
      data: {
        userId: ride.userId,
        rideId: ride.id,
        type: 'REFUND',
        stripeTransactionId: refund.id,
        amount: -Math.abs(amount || ride.payment.amount),
        status: 'SUCCEEDED',
        description: `Refund: ${reason || 'No reason provided'}`,
      },
    });

    res.json({
      success: true,
      data: { 
        payment: updatedPayment,
        refund,
      },
      message: 'Refund processed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Refund processing failed',
    });
  }
}));

// Generate receipt/invoice
router.get('/:paymentId/receipt', authMiddleware, asyncHandler(async (req: any, res) => {
  const { paymentId } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      ride: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      invoice: true,
    },
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Check access permissions
  const hasAccess = req.user.isAdmin || 
    payment.userId === req.user.id || 
    (payment.ride?.driver && payment.ride.driver.userId === req.user.id);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Generate or get existing invoice
  let invoice = payment.invoice;
  
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        invoiceNumber: `INV-${Date.now()}`,
        subtotal: payment.amount,
        tax: 0,
        total: payment.amount,
        status: 'PAID',
        paidAt: payment.paidAt,
      },
    });
  }

  res.json({
    success: true,
    data: {
      payment,
      invoice,
    },
  });
}));

// Get all payments (admin only)
router.get('/', adminMiddleware, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    dateFrom,
    dateTo,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
    if (dateTo) where.createdAt.lte = new Date(dateTo as string);
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        ride: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

export default router;