import { DriverProfile, DriverStatus, Prisma } from '@prisma/client';

import { prisma } from '../db/prisma';

export const driverProfileService = {
  create(data: Prisma.DriverProfileCreateInput): Promise<DriverProfile> {
    return prisma.driverProfile.create({ data });
  },

  getById(id: string) {
    return prisma.driverProfile.findUnique({
      where: { id },
      include: { user: true, vehicles: true },
    });
  },

  updateStatus(id: string, status: DriverStatus) {
    return prisma.driverProfile.update({
      where: { id },
      data: { status },
    });
  },

  list(params?: { status?: DriverStatus; take?: number; skip?: number }) {
    const { status, take = 50, skip = 0 } = params ?? {};

    return prisma.driverProfile.findMany({
      where: status ? { status } : undefined,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  },
};
