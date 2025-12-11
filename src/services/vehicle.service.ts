import { Prisma, Vehicle } from '@prisma/client';

import { prisma } from '../db/prisma';

export const vehicleService = {
  create(data: Prisma.VehicleCreateInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  },

  getById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: { driverProfile: { include: { user: true } } },
    });
  },

  listForDriverProfile(driverProfileId: string, params?: { take?: number; skip?: number }) {
    const { take = 50, skip = 0 } = params ?? {};

    return prisma.vehicle.findMany({
      where: { driverProfileId },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },
};
