import { NextRequest } from "next/server";
import { listDeliveries } from "@/lib/deliveries";
import { GLOBAL_CHANNEL, subscribe } from "@/lib/bus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Global SSE feed: every delivery update across the system (admin views). */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const enqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      // Initial full snapshot.
      const deliveries = await listDeliveries();
      enqueue(`data: ${JSON.stringify({ kind: "snapshot", data: deliveries })}\n\n`);

      const unsubscribe = subscribe(GLOBAL_CHANNEL, (payload) => {
        enqueue(`data: ${payload}\n\n`);
      });

      const ping = setInterval(() => enqueue(`: ping\n\n`), 20000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
