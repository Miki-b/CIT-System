import { prisma } from "./prisma";

/**
 * Generate the next sequential CIT tracking code (CIT-1001, CIT-1002, ...).
 * Parses the numeric suffix of existing codes and returns max + 1.
 */
export async function nextTrackingCode(): Promise<string> {
  const rows = await prisma.delivery.findMany({
    select: { trackingCode: true },
  });
  let max = 1000;
  for (const r of rows) {
    const m = /^CIT-(\d+)$/.exec(r.trackingCode);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `CIT-${max + 1}`;
}
