import Event from "@/models/Event";
import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import { Expo } from "expo-server-sdk";

export async function POST(req, { params }) {
  await dbConnect(); // Ensure DB connection
  const { id } = await params; // Extract event ID

  try {
    // 1️⃣ Find the event
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 2️⃣ Check if event is paid and not already refunded
    if (!event.isPaid) {
      return NextResponse.json({ error: "This event is not a paid event" }, { status: 400 });
    }
    if (event.refundStatus === "refunded") {
      return NextResponse.json({ error: "Refund already processed" }, { status: 400 });
    }

    // 3️⃣ Update event refund status
    event.refundStatus = "refund_in_progress";
    await event.save();

    // 4️⃣ Find all students registered for the event
    const students = await Student.find({ eventId: id, refundStatus: "none" });

    if (students.length === 0) {
      return NextResponse.json({ message: "No students to refund." });
    }

    // 5️⃣ Update student refund status to 'refund_progress'
    await Promise.all(
      students.map(async (student) => {
        student.refundStatus = "refund_progress";
        await student.save();
      })
    );

    // 6️⃣ Send notifications
    const expo = new Expo();
    const messages = [];
    const notificationBody = `Refund process started for event: ${event.eventName}`;
    students.forEach(student => {
        if (Expo.isExpoPushToken(student.expoPushToken)) {
          messages.push({
            to: student.expoPushToken,
            sound: 'default',
            title: "Refund Process Started",
            body: notificationBody,
            data: { eventId: id, type: "event_refund", organizerId: event.organizer, studentId: student._id },
          });
        }
    });
    const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
    }

    return NextResponse.json({ message: "Refund process started successfully" });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
