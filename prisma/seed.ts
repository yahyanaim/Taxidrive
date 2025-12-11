import {
  DriverStatus,
  NotificationChannel,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  PrismaClient,
  RideStatus,
  TransactionStatus,
  TransactionType,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const ids = {
  riderUser: '11111111-1111-1111-1111-111111111111',
  driverUser: '22222222-2222-2222-2222-222222222222',
  driverProfile: '33333333-3333-3333-3333-333333333333',
  vehicle: '44444444-4444-4444-4444-444444444444',
  ride: '55555555-5555-5555-5555-555555555555',
  payment: '66666666-6666-6666-6666-666666666666',
  transaction: '77777777-7777-7777-7777-777777777777',
  notification1: '88888888-8888-8888-8888-888888888888',
  notification2: '99999999-9999-9999-9999-999999999999',
  ratingRiderToDriver: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  ratingDriverToRider: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
} as const;

async function upsertBaseData() {
  await prisma.user.upsert({
    where: { id: ids.riderUser },
    create: {
      id: ids.riderUser,
      email: 'rider@example.com',
      phone: '+15555550101',
      name: 'Rider One',
      role: UserRole.RIDER,
    },
    update: {
      email: 'rider@example.com',
      phone: '+15555550101',
      name: 'Rider One',
      role: UserRole.RIDER,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.driverUser },
    create: {
      id: ids.driverUser,
      email: 'driver@example.com',
      phone: '+15555550102',
      name: 'Driver One',
      role: UserRole.DRIVER,
    },
    update: {
      email: 'driver@example.com',
      phone: '+15555550102',
      name: 'Driver One',
      role: UserRole.DRIVER,
    },
  });

  await prisma.driverProfile.upsert({
    where: { id: ids.driverProfile },
    create: {
      id: ids.driverProfile,
      userId: ids.driverUser,
      licenseNumber: 'D-123-456-789',
      status: DriverStatus.APPROVED,
      bio: 'Sample approved driver profile',
    },
    update: {
      userId: ids.driverUser,
      licenseNumber: 'D-123-456-789',
      status: DriverStatus.APPROVED,
      bio: 'Sample approved driver profile',
    },
  });

  await prisma.vehicle.upsert({
    where: { id: ids.vehicle },
    create: {
      id: ids.vehicle,
      driverProfileId: ids.driverProfile,
      make: 'Toyota',
      model: 'Prius',
      year: 2022,
      plateNumber: 'TEST-1234',
      color: 'Blue',
      isActive: true,
    },
    update: {
      driverProfileId: ids.driverProfile,
      make: 'Toyota',
      model: 'Prius',
      year: 2022,
      plateNumber: 'TEST-1234',
      color: 'Blue',
      isActive: true,
    },
  });

  await prisma.ride.upsert({
    where: { id: ids.ride },
    create: {
      id: ids.ride,
      riderId: ids.riderUser,
      driverProfileId: ids.driverProfile,
      vehicleId: ids.vehicle,
      status: RideStatus.COMPLETED,
      pickupAddress: 'Times Square, NYC',
      dropoffAddress: 'Central Park, NYC',
      pickupLat: new Prisma.Decimal('40.758000'),
      pickupLng: new Prisma.Decimal('-73.985500'),
      dropoffLat: new Prisma.Decimal('40.781200'),
      dropoffLng: new Prisma.Decimal('-73.966500'),
      requestedAt: new Date(Date.now() - 1000 * 60 * 60),
      acceptedAt: new Date(Date.now() - 1000 * 60 * 55),
      startedAt: new Date(Date.now() - 1000 * 60 * 50),
      completedAt: new Date(Date.now() - 1000 * 60 * 40),
      fareCents: 1899,
      currency: 'USD',
    },
    update: {
      riderId: ids.riderUser,
      driverProfileId: ids.driverProfile,
      vehicleId: ids.vehicle,
      status: RideStatus.COMPLETED,
      pickupAddress: 'Times Square, NYC',
      dropoffAddress: 'Central Park, NYC',
      pickupLat: new Prisma.Decimal('40.758000'),
      pickupLng: new Prisma.Decimal('-73.985500'),
      dropoffLat: new Prisma.Decimal('40.781200'),
      dropoffLng: new Prisma.Decimal('-73.966500'),
      requestedAt: new Date(Date.now() - 1000 * 60 * 60),
      acceptedAt: new Date(Date.now() - 1000 * 60 * 55),
      startedAt: new Date(Date.now() - 1000 * 60 * 50),
      completedAt: new Date(Date.now() - 1000 * 60 * 40),
      fareCents: 1899,
      currency: 'USD',
    },
  });

  await prisma.$executeRaw`
    UPDATE "Ride"
    SET
      "pickupLocation" = ST_SetSRID(ST_MakePoint("pickupLng"::double precision, "pickupLat"::double precision), 4326)::geography,
      "dropoffLocation" = ST_SetSRID(ST_MakePoint("dropoffLng"::double precision, "dropoffLat"::double precision), 4326)::geography
    WHERE "id" = ${ids.ride}::uuid;
  `;

  await prisma.payment.upsert({
    where: { id: ids.payment },
    create: {
      id: ids.payment,
      rideId: ids.ride,
      payerId: ids.riderUser,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.CAPTURED,
      amountCents: 1899,
      currency: 'USD',
    },
    update: {
      rideId: ids.ride,
      payerId: ids.riderUser,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.CAPTURED,
      amountCents: 1899,
      currency: 'USD',
    },
  });

  await prisma.transaction.upsert({
    where: { id: ids.transaction },
    create: {
      id: ids.transaction,
      paymentId: ids.payment,
      type: TransactionType.CHARGE,
      status: TransactionStatus.SUCCEEDED,
      providerRef: 'ch_test_123',
      amountCents: 1899,
    },
    update: {
      paymentId: ids.payment,
      type: TransactionType.CHARGE,
      status: TransactionStatus.SUCCEEDED,
      providerRef: 'ch_test_123',
      amountCents: 1899,
    },
  });

  await prisma.notification.upsert({
    where: { id: ids.notification1 },
    create: {
      id: ids.notification1,
      userId: ids.riderUser,
      type: NotificationType.RIDE_STATUS,
      channel: NotificationChannel.PUSH,
      title: 'Ride completed',
      body: 'Your ride has been completed successfully.',
    },
    update: {
      userId: ids.riderUser,
      type: NotificationType.RIDE_STATUS,
      channel: NotificationChannel.PUSH,
      title: 'Ride completed',
      body: 'Your ride has been completed successfully.',
    },
  });

  await prisma.notification.upsert({
    where: { id: ids.notification2 },
    create: {
      id: ids.notification2,
      userId: ids.driverUser,
      type: NotificationType.PAYMENT,
      channel: NotificationChannel.EMAIL,
      title: 'Payment captured',
      body: 'A payment has been captured for a completed ride.',
    },
    update: {
      userId: ids.driverUser,
      type: NotificationType.PAYMENT,
      channel: NotificationChannel.EMAIL,
      title: 'Payment captured',
      body: 'A payment has been captured for a completed ride.',
    },
  });

  await prisma.rating.upsert({
    where: { id: ids.ratingRiderToDriver },
    create: {
      id: ids.ratingRiderToDriver,
      rideId: ids.ride,
      raterUserId: ids.riderUser,
      rateeUserId: ids.driverUser,
      score: 5,
      comment: 'Great ride!',
    },
    update: {
      rideId: ids.ride,
      raterUserId: ids.riderUser,
      rateeUserId: ids.driverUser,
      score: 5,
      comment: 'Great ride!',
    },
  });

  await prisma.rating.upsert({
    where: { id: ids.ratingDriverToRider },
    create: {
      id: ids.ratingDriverToRider,
      rideId: ids.ride,
      raterUserId: ids.driverUser,
      rateeUserId: ids.riderUser,
      score: 5,
      comment: 'Perfect passenger.',
    },
    update: {
      rideId: ids.ride,
      raterUserId: ids.driverUser,
      rateeUserId: ids.riderUser,
      score: 5,
      comment: 'Perfect passenger.',
    },
  });
}

async function main() {
  await upsertBaseData();
}

main()
  .then(async () => {
    console.log('Seed completed');
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('Seed failed');
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
