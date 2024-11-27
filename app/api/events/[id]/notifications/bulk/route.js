import Notification from "@/models/Notification"; // Replace with your actual Notification model
import Student from "@/models/Student"; // Replace with your actual Student model
import dbConnect from "@/lib/db";
import { nanoid } from "nanoid";

// POST: Create multiple notifications for a specific event
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID

  try {
    const { notifications } = await req.json(); // Expect an array of notifications
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return new Response("No notifications provided", { status: 400 });
    }

    const newNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const { studentId, title, body } = notification;

        // Ensure required fields are present
        if (!studentId || !title || !body) {
          throw new Error("Missing required fields for a notification");
        }

        // Verify the student exists
        const student = await Student.findById(studentId);
        if (!student) {
          throw new Error(`Student not found: ${studentId}`);
        }

        // Create and return the new notification object
        return {
          studentId,
          eventId: id,
          notificationId: nanoid(10), // Automatically generate notificationId
          title,
          body,
          sentAt: new Date(),
        };
      })
    );

    // Insert notifications into the database
    const insertedNotifications = await Notification.insertMany(newNotifications);

    // Optionally log or send notifications
    console.log(`Bulk notifications sent for event ${id}:`, insertedNotifications);

    return new Response(JSON.stringify(insertedNotifications), { status: 201 });
  } catch (error) {
    console.error("Error creating bulk notifications:", error.message || error);
    return new Response(`Error creating bulk notifications: ${error.message}`, {
      status: 500,
    });
  }
}
