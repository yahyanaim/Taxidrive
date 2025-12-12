import {
  Payment,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { prisma } from '../db/prisma';

export const paymentService = {
  createForRide(input: {
    rideId: string;
    payerId: string;
    provider: PaymentProvider;
    amountCents: number;
    currency?: string;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        rideId: input.rideId,
        payerId: input.payerId,
        provider: input.provider,
        status: PaymentStatus.PENDING,
        amountCents: input.amountCents,
        currency: input.currency ?? 'USD',
      },
    });
  },

  updateStatus(paymentId: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  },

  recordTransaction(input: {
    paymentId: string;
    type: TransactionType;
    status: TransactionStatus;
    providerRef?: string;
    amountCents: number;
  }): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        paymentId: input.paymentId,
        type: input.type,
        status: input.status,
        providerRef: input.providerRef,
        amountCents: input.amountCents,
      },
    });
  },

  getWithTransactions(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: { transactions: true },
    });
  },

  listByPayer(payerId: string, params?: { take?: number; skip?: number }) {
    const { take = 50, skip = 0 } = params ?? {};

    return prisma.payment.findMany({
      where: { payerId },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },

  async inTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  },
};
