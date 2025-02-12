import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

let clients = {}; // Store SSE clients per organizer

export async function GET(req, { params }) {
  const { organizer_id } = await params;

  if (!organizer_id) {
    return new Response("Missing organizer_id", { status: 400 });
  }

  await dbConnect();

  // Fetch notifications that have not been sent yet or need to be resent (based on sentAt)
  const notifications = await Notification.find({
    organizerId: organizer_id,
    sentAt: { $gte: new Date() } // Check if the notification has been sent (sentAt field)
  }).sort({ sentAt: -1 });

  if (!clients[organizer_id]) {
    clients[organizer_id] = [];
  }

  const stream = new ReadableStream({
    start(controller) {
      // Remove disconnected clients before adding new one
      clients[organizer_id].push(controller);
      console.log(`New SSE connection for organizer ${organizer_id}. Active connections: ${clients[organizer_id].length}`);

      // Send only the most recent notifications (avoid duplicates)
      const uniqueNotifications = new Map();
      notifications.forEach((notif) => {
        // Mark as sent when sent to client
        uniqueNotifications.set(notif.notificationId, notif);
      });

      uniqueNotifications.forEach((notif) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(notif)}\n\n`);
        } catch (error) {
          console.error("Error enqueueing data:", error);
        }
      });

      // Cleanup function for disconnected clients
      const removeClient = () => {
        clients[organizer_id] = clients[organizer_id].filter((c) => c !== controller);
        console.log(`Client disconnected. Remaining clients: ${clients[organizer_id]?.length}`);
      };

      req.signal.addEventListener("abort", removeClient);
    },
    cancel(reason) {
      console.log(`Stream canceled for organizer ${organizer_id}:`, reason);
      clients[organizer_id] = clients[organizer_id]?.filter((c) => c !== reason) || [];
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}