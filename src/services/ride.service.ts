import { Prisma, Ride, RideStatus } from '@prisma/client';

import { prisma } from '../db/prisma';

type CreateRideInput = {
  riderId: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupLat: Prisma.Decimal;
  pickupLng: Prisma.Decimal;
  dropoffLat: Prisma.Decimal;
  dropoffLng: Prisma.Decimal;
  fareCents: number;
  currency?: string;
};

async function setRideGeographyFromLatLng(rideId: string) {
  await prisma.$executeRaw`
    UPDATE "Ride"
    SET
      "pickupLocation" = ST_SetSRID(ST_MakePoint("pickupLng"::double precision, "pickupLat"::double precision), 4326)::geography,
      "dropoffLocation" = ST_SetSRID(ST_MakePoint("dropoffLng"::double precision, "dropoffLat"::double precision), 4326)::geography
    WHERE "id" = ${rideId}::uuid;
  `;
}

export const rideService = {
  async create(input: CreateRideInput): Promise<Ride> {
    const ride = await prisma.ride.create({
      data: {
        riderId: input.riderId,
        pickupAddress: input.pickupAddress,
        dropoffAddress: input.dropoffAddress,
        pickupLat: input.pickupLat,
        pickupLng: input.pickupLng,
        dropoffLat: input.dropoffLat,
        dropoffLng: input.dropoffLng,
        fareCents: input.fareCents,
        currency: input.currency ?? 'USD',
      },
    });

    await setRideGeographyFromLatLng(ride.id);

    return ride;
  },

  assignDriver(params: { rideId: string; driverProfileId: string; vehicleId?: string }) {
    return prisma.ride.update({
      where: { id: params.rideId },
      data: {
        driverProfileId: params.driverProfileId,
        vehicleId: params.vehicleId,
        status: RideStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });
  },

  updateStatus(params: { rideId: string; status: RideStatus }) {
    const now = new Date();

    const timestamps: Prisma.RideUpdateInput =
      params.status === RideStatus.IN_PROGRESS
        ? { startedAt: now }
        : params.status === RideStatus.COMPLETED
          ? { completedAt: now }
          : params.status === RideStatus.CANCELED
            ? { canceledAt: now }
            : {};

    return prisma.ride.update({
      where: { id: params.rideId },
      data: {
        status: params.status,
        ...timestamps,
      },
    });
  },

  getById(id: string) {
    return prisma.ride.findUnique({
      where: { id },
      include: {
        rider: true,
        driverProfile: { include: { user: true } },
        vehicle: true,
        payment: true,
        ratings: true,
      },
    });
  },

  listByRider(riderId: string, params?: { take?: number; skip?: number }) {
    const { take = 50, skip = 0 } = params ?? {};

    return prisma.ride.findMany({
      where: { riderId },
      take,
      skip,
      orderBy: { requestedAt: 'desc' },
    });
  },

  async findNearPickup(params: {
    lat: number;
    lng: number;
    radiusMeters: number;
    take?: number;
  }): Promise<Ride[]> {
    const { lat, lng, radiusMeters, take = 50 } = params;

    return prisma.$queryRaw<Ride[]>`
      SELECT *
      FROM "Ride"
      WHERE "pickupLocation" IS NOT NULL
        AND ST_DWithin(
          "pickupLocation",
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY "requestedAt" DESC
      LIMIT ${take};
    `;
  },
};
