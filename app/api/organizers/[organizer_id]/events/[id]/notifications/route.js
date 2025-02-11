import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import EventOrganizer from "@/models/EventOrganizer";
import mongoose from "mongoose";

let clients = {}; // Store SSE clients per event

export async function GET(req, { params }) {
  const { id } = await params; // Extract dynamic parameters

  if (!id) {
    return new Response("Missing organizer_id or event_id", { status: 400 });
  }

  await dbConnect();

  const organizer_id = await EventOrganizer.findOne({ eventId: id }).select("_id");

  const eventKey = `${organizer_id}-${id}`;

  const stream = new ReadableStream({
    start(controller) {
      if (!clients[eventKey]) {
        clients[eventKey] = [];
      }

      const client = controller;
      clients[eventKey].push(client);

      const sendEvent = (data) => {
        client.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      req.signal.addEventListener("abort", () => {
        clients[eventKey] = clients[eventKey].filter((c) => c !== client);
      });
    },
    cancel() {
      clients[eventKey] = clients[eventKey]?.filter((c) => c !== this) || [];
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
  const { organizer_id, id } = params; // Extract dynamic parameters

  if (!organizer_id || !id) {
    return new Response("Missing organizer_id or event_id", { status: 400 });
  }

  await dbConnect();
  const { title, body } = await req.json();

  const newNotification = new Notification({
    notificationId: new mongoose.Types.ObjectId().toString(),
    eventId: id,
    organizerId: organizer_id,
    title,
    body,
  });

  await newNotification.save();

  const eventKey = `${organizer_id}-${id}`;

  // Send update to all clients subscribed to this specific event
  if (clients[eventKey]) {
    clients[eventKey].forEach((client) => {
      client.enqueue(`data: ${JSON.stringify(newNotification)}\n\n`);
    });
  }

  return new Response(JSON.stringify(newNotification), { status: 201 });
}
