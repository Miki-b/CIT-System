import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Linear interpolation between two coordinates. */
function lerp(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  t: number
) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/** Minutes-ago helper for building realistic timelines. */
function minsAgo(m: number): Date {
  return new Date(Date.now() - m * 60000);
}

async function main() {
  console.log("🌱 Seeding CIT tracking database...");

  // Clean slate (respect FK order).
  await prisma.deliveryEvent.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  /* ------------------------------- Users -------------------------------- */
  await prisma.user.createMany({
    data: [
      { name: "Dispatch Admin", email: "admin@citsecure.io", role: "ADMIN" },
      { name: "Daniel Bekele", email: "daniel@citsecure.io", role: "DRIVER" },
      { name: "Samuel Tesfaye", email: "samuel@citsecure.io", role: "DRIVER" },
      { name: "Michael Adams", email: "michael@citsecure.io", role: "DRIVER" },
    ],
  });

  /* ------------------------------ Drivers ------------------------------- */
  const daniel = await prisma.driver.create({
    data: {
      name: "Daniel Bekele",
      phone: "+1 (212) 555-0142",
      status: "ON_DELIVERY",
    },
  });
  const samuel = await prisma.driver.create({
    data: {
      name: "Samuel Tesfaye",
      phone: "+1 (212) 555-0173",
      status: "ON_DELIVERY",
    },
  });
  const michael = await prisma.driver.create({
    data: {
      name: "Michael Adams",
      phone: "+1 (212) 555-0198",
      status: "AVAILABLE",
    },
  });
  // A couple of extra available drivers so the dashboard "available" count reads well.
  await prisma.driver.create({
    data: { name: "Grace Okoro", phone: "+1 (212) 555-0210", status: "AVAILABLE" },
  });
  await prisma.driver.create({
    data: { name: "Liam Novak", phone: "+1 (212) 555-0233", status: "AVAILABLE" },
  });

  /* ------------------------------ Clients ------------------------------- */
  const acme = await prisma.client.create({
    data: {
      name: "Acme Financial",
      company: "Acme Financial Group",
      email: "ops@acmefinancial.com",
      phone: "+1 (212) 555-1000",
    },
  });
  const globalBank = await prisma.client.create({
    data: {
      name: "Global Retail Bank",
      company: "Global Retail Bank N.A.",
      email: "logistics@globalretailbank.com",
      phone: "+1 (212) 555-2000",
    },
  });
  const united = await prisma.client.create({
    data: {
      name: "United Cash Services",
      company: "United Cash Services LLC",
      email: "dispatch@unitedcash.com",
      phone: "+1 (212) 555-3000",
    },
  });

  /* ===================================================================== */
  /* CIT-1001 — IN_TRANSIT, mid-route, live and ready for the demo          */
  /* ===================================================================== */
  const pickup1001 = { lat: 40.7089, lng: -74.0089 }; // Federal Reserve Bank of NY
  const dest1001 = { lat: 40.7033, lng: -74.017 }; // Downtown Secure Facility (Battery Park)
  const progress1001 = 0.4;
  const cur1001 = lerp(pickup1001, dest1001, progress1001);

  const d1001 = await prisma.delivery.create({
    data: {
      trackingCode: "CIT-1001",
      clientId: acme.id,
      driverId: daniel.id,
      pickupName: "Federal Reserve Bank of New York",
      pickupLatitude: pickup1001.lat,
      pickupLongitude: pickup1001.lng,
      destinationName: "Downtown Secure Facility",
      destinationLatitude: dest1001.lat,
      destinationLongitude: dest1001.lng,
      status: "IN_TRANSIT",
      priority: "HIGH",
      progress: progress1001,
      currentLatitude: cur1001.lat,
      currentLongitude: cur1001.lng,
      eta: new Date(Date.now() + 9 * 60000),
      createdAt: minsAgo(33),
    },
  });
  await prisma.driver.update({
    where: { id: daniel.id },
    data: { currentLatitude: cur1001.lat, currentLongitude: cur1001.lng },
  });
  await prisma.deliveryEvent.createMany({
    data: [
      {
        deliveryId: d1001.id,
        type: "CREATED",
        message: "Delivery created",
        latitude: pickup1001.lat,
        longitude: pickup1001.lng,
        createdAt: minsAgo(33),
      },
      {
        deliveryId: d1001.id,
        type: "ASSIGNED",
        message: "Driver Daniel Bekele assigned to delivery",
        createdAt: minsAgo(30),
      },
      {
        deliveryId: d1001.id,
        type: "AT_PICKUP",
        message: "Driver arrived at pickup location",
        latitude: pickup1001.lat,
        longitude: pickup1001.lng,
        createdAt: minsAgo(21),
      },
      {
        deliveryId: d1001.id,
        type: "PICKED_UP",
        message: "Consignment secured and picked up",
        latitude: pickup1001.lat,
        longitude: pickup1001.lng,
        createdAt: minsAgo(17),
      },
      {
        deliveryId: d1001.id,
        type: "IN_TRANSIT",
        message: "Delivery started — en route to destination",
        latitude: pickup1001.lat,
        longitude: pickup1001.lng,
        createdAt: minsAgo(15),
      },
      {
        deliveryId: d1001.id,
        type: "LOCATION",
        message: "Leaving pickup — route underway",
        latitude: lerp(pickup1001, dest1001, 0.25).lat,
        longitude: lerp(pickup1001, dest1001, 0.25).lng,
        createdAt: minsAgo(6),
      },
    ],
  });

  /* ===================================================================== */
  /* CIT-1002 — ASSIGNED, awaiting pickup                                   */
  /* ===================================================================== */
  const pickup1002 = { lat: 40.758, lng: -73.9855 }; // Times Square vault
  const dest1002 = { lat: 40.7527, lng: -73.9772 }; // Grand Central Depository
  const d1002 = await prisma.delivery.create({
    data: {
      trackingCode: "CIT-1002",
      clientId: globalBank.id,
      driverId: samuel.id,
      pickupName: "Chase Midtown Vault",
      pickupLatitude: pickup1002.lat,
      pickupLongitude: pickup1002.lng,
      destinationName: "Grand Central Depository",
      destinationLatitude: dest1002.lat,
      destinationLongitude: dest1002.lng,
      status: "ASSIGNED",
      priority: "STANDARD",
      progress: 0,
      currentLatitude: pickup1002.lat,
      currentLongitude: pickup1002.lng,
      eta: new Date(Date.now() + 24 * 60000),
      createdAt: minsAgo(8),
    },
  });
  await prisma.deliveryEvent.createMany({
    data: [
      {
        deliveryId: d1002.id,
        type: "CREATED",
        message: "Delivery created",
        latitude: pickup1002.lat,
        longitude: pickup1002.lng,
        createdAt: minsAgo(8),
      },
      {
        deliveryId: d1002.id,
        type: "ASSIGNED",
        message: "Driver Samuel Tesfaye assigned to delivery",
        createdAt: minsAgo(5),
      },
    ],
  });

  /* ===================================================================== */
  /* CIT-1003 — DELIVERED, full historical timeline                         */
  /* ===================================================================== */
  const pickup1003 = { lat: 40.6928, lng: -73.9903 }; // Brooklyn Cash Center
  const dest1003 = { lat: 40.6446, lng: -73.7797 }; // JFK Secure Bay
  const d1003 = await prisma.delivery.create({
    data: {
      trackingCode: "CIT-1003",
      clientId: united.id,
      driverId: michael.id,
      pickupName: "Brooklyn Cash Center",
      pickupLatitude: pickup1003.lat,
      pickupLongitude: pickup1003.lng,
      destinationName: "JFK Airport Secure Bay",
      destinationLatitude: dest1003.lat,
      destinationLongitude: dest1003.lng,
      status: "DELIVERED",
      priority: "CRITICAL",
      progress: 1,
      currentLatitude: dest1003.lat,
      currentLongitude: dest1003.lng,
      eta: null,
      createdAt: minsAgo(95),
    },
  });
  await prisma.deliveryEvent.createMany({
    data: [
      {
        deliveryId: d1003.id,
        type: "CREATED",
        message: "Delivery created",
        createdAt: minsAgo(95),
      },
      {
        deliveryId: d1003.id,
        type: "ASSIGNED",
        message: "Driver Michael Adams assigned to delivery",
        createdAt: minsAgo(92),
      },
      {
        deliveryId: d1003.id,
        type: "AT_PICKUP",
        message: "Driver arrived at pickup location",
        latitude: pickup1003.lat,
        longitude: pickup1003.lng,
        createdAt: minsAgo(85),
      },
      {
        deliveryId: d1003.id,
        type: "PICKED_UP",
        message: "Consignment secured and picked up",
        latitude: pickup1003.lat,
        longitude: pickup1003.lng,
        createdAt: minsAgo(81),
      },
      {
        deliveryId: d1003.id,
        type: "IN_TRANSIT",
        message: "Delivery started — en route to destination",
        createdAt: minsAgo(79),
      },
      {
        deliveryId: d1003.id,
        type: "NEAR_DESTINATION",
        message: "Driver is near the destination",
        latitude: lerp(pickup1003, dest1003, 0.85).lat,
        longitude: lerp(pickup1003, dest1003, 0.85).lng,
        createdAt: minsAgo(52),
      },
      {
        deliveryId: d1003.id,
        type: "DELIVERED",
        message: "Delivery completed successfully",
        latitude: dest1003.lat,
        longitude: dest1003.lng,
        createdAt: minsAgo(48),
      },
    ],
  });

  console.log("✅ Seed complete:");
  console.log("   • 5 drivers, 3 clients, 3 deliveries");
  console.log("   • CIT-1001 (IN_TRANSIT) — ready for live simulation demo");
  console.log("   • CIT-1002 (ASSIGNED)");
  console.log("   • CIT-1003 (DELIVERED)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
