import { Rating } from '@prisma/client';

import { prisma } from '../db/prisma';

export const ratingService = {
  rateRide(input: {
    rideId: string;
    raterUserId: string;
    rateeUserId: string;
    score: number;
    comment?: string;
  }): Promise<Rating> {
    return prisma.rating.create({
      data: {
        rideId: input.rideId,
        raterUserId: input.raterUserId,
        rateeUserId: input.rateeUserId,
        score: input.score,
        comment: input.comment,
      },
    });
  },

  listForUser(rateeUserId: string, params?: { take?: number; skip?: number }) {
    const { take = 50, skip = 0 } = params ?? {};

    return prisma.rating.findMany({
      where: { rateeUserId },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },
};
