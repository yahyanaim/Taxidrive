import { Prisma, User } from '@prisma/client';

import { prisma } from '../db/prisma';

export const userService = {
  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  getById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  getByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  getWithDriverProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { driverProfile: true },
    });
  },

  list(params?: { role?: Prisma.UserWhereInput['role']; take?: number; skip?: number }) {
    const { role, take = 50, skip = 0 } = params ?? {};

    return prisma.user.findMany({
      where: role ? { role } : undefined,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },
};
