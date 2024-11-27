import Notification from "@/models/Notification"; // Replace with your actual Notification model
import Student from "@/models/Student"; // Replace with your actual Student model
import dbConnect from "@/lib/db";
import { nanoid } from "nanoid"; // Optional: for unique notification IDs

// GET: Fetch all notifications for a specific event
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID
  try {
    const notifications = await Notification.find({ eventId: id });
    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new Response("Error fetching notifications", { status: 500 });
  }
}

// POST: Create a new notification for a specific event
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID

  try {
    const { studentId, title, body } = await req.json();
    if (!studentId || !title || !body) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Fetch the student to ensure it exists
    const student = await Student.findById(studentId);
    if (!student) {
      return new Response("Student not found", { status: 404 });
    }

    const newNotification = new Notification({
      studentId,
      eventId: id,
      notificationId: nanoid(10), // Automatically generate notificationId
      title,
      body,
      sentAt: new Date(),
    });

    await newNotification.save();

    // Optionally send the notification (replace with your actual sending logic)
    console.log(`Notification sent to ${student.email}:`, { title, body });

    return new Response(JSON.stringify(newNotification), { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response("Error creating notification", { status: 500 });
  }
}

// PUT: Update a specific notification
export async function PUT(req, { params }) {
  await dbConnect();
  const { id, notificationid } = await params; // Event ID and Notification ID
  const data = await req.json();

  try {
    const updatedNotification = await Notification.findOneAndUpdate(
      { notificationId: notificationid, eventId: id },
      data,
      { new: true }
    );

    if (!updatedNotification) {
      return new Response("Notification not found", { status: 404 });
    }

    return new Response(JSON.stringify(updatedNotification), { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return new Response("Error updating notification", { status: 500 });
  }
}

// DELETE: Delete a specific notification
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id, notificationid } = await params; // Event ID and Notification ID

  try {
    const deletedNotification = await Notification.findOneAndDelete({
      notificationId: notificationid,
      eventId: id,
    });

    if (!deletedNotification) {
      return new Response("Notification not found", { status: 404 });
    }

    return new Response("Notification deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new Response("Error deleting notification", { status: 500 });
  }
}
