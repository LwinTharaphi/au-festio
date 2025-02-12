import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

let clients = {}; // Store SSE clients per organizer

let sentNotifications = new Map(); // Track sent notifications per organizer

export async function GET(req, { params }) {
  const { organizer_id } = await params;

  if (!organizer_id) {
    return new Response("Missing organizer_id", { status: 400 });
  }

  await dbConnect();

  // Fetch all notifications for the given organizer, regardless of whether they have been sent or not.
  const notifications = await Notification.find({ organizerId: organizer_id }).sort({ sentAt: -1 });

  return new Response(JSON.stringify(notifications), { status: 200 });
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

  // Send the notification to clients only if it's not already sent
  if (clients[organizer_id]) {
    // Remove closed clients before sending data
    clients[organizer_id] = clients[organizer_id].filter((c) => c.desiredSize !== null);

    clients[organizer_id].forEach((client) => {
      try {
        if (client.desiredSize !== null && !sentNotifications.get(organizer_id)?.has(newNotification.notificationId)) {
          client.enqueue(`data: ${JSON.stringify(newNotification)}\n\n`);
          
          // Track the notification as sent for this organizer
          sentNotifications.get(organizer_id)?.add(newNotification.notificationId);
        }
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
    clients[organizerId] = clients[organizerId].filter((c) => !c.desiredSize); // ✅ Remove closed clients

    clients[organizerId].forEach((client) => {
      try {
        if (!client.desiredSize) return; // ✅ Prevent sending if closed
        client.enqueue(`data: ${JSON.stringify(newNotification)}\n\n`);
      } catch (error) {
        console.error("Error sending SSE:", error);
      }
    });
  }
}



export async function PATCH(req, { params }) {
  const { notification_id } = params;

  if (!notification_id) {
    return new Response("Missing notification_id", { status: 400 });
  }

  await dbConnect();

  const updatedNotification = await Notification.findByIdAndUpdate(
    notification_id,
    { read: true },  // ✅ Mark as read
    { new: true }
  );

  if (!updatedNotification) {
    return new Response("Notification not found", { status: 404 });
  }

  return new Response(JSON.stringify(updatedNotification), { status: 200 });
}



