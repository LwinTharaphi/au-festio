import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

let clients = {}; // Store SSE clients per organizer

export async function GET(req, { params }) {
  const { organizer_id } = await params; // Extract organizer_id from URL

  if (!organizer_id) {
    return new Response("Missing organizer_id", { status: 400 });
  }

  await dbConnect();

  const notifications = await Notification.find({ organizerId: organizer_id }).sort({ sentAt: -1 });

  if (!clients[organizer_id]) {
    clients[organizer_id] = [];
  }

  const stream = new ReadableStream({
    start(controller) {
      clients[organizer_id].push(controller);

      // Send existing notifications
      notifications.forEach((notif) => {
        controller.enqueue(`data: ${JSON.stringify(notif)}\n\n`);
      });

      req.signal.addEventListener("abort", () => {
        clients[organizer_id] = clients[organizer_id].filter((c) => c !== controller);
        if (clients[organizer_id].length === 0) {
          delete clients[organizer_id];
        }
      });
    },
    cancel(reason) {
      clients[organizer_id] = clients[organizer_id]?.filter((c) => c !== reason) || [];
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req, { params }) {
  const { organizer_id } = await params;

  if (!organizer_id) {
    return new Response("Missing organizer_id", { status: 400 });
  }

  await dbConnect();
  const { title, body, eventId } = await req.json();

  const newNotification = new Notification({
    notificationId: new mongoose.Types.ObjectId().toString(),
    eventId,
    organizerId: organizer_id,
    title,
    body,
  });

  await newNotification.save();

  if (clients[organizer_id]) {
    clients[organizer_id].forEach((client) => {
      try{
        client.enqueue(`data: ${JSON.stringify(newNotification)}\n\n`);
      } catch (error) {
        console.error("Error sending SSE:", error);
      }
    });
  }

  return new Response(JSON.stringify(newNotification), { status: 201 });
}

export function sendEventsToAll(newNotification) {
  const organizerId = newNotification.organizerId;
  if (clients[organizerId]) {
    clients[organizerId].forEach((client) => {
      try {
        client.enqueue(`data: ${JSON.stringify(newNotification)}\n\n`);
      } catch (error) {
        console.error("Error sending SSE:", error);
      }
    });
  }
}


