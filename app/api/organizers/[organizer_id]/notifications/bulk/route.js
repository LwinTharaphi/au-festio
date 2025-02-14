import Notification from "@/models/Notification"; // Replace with your actual Notification model
import dbConnect from "@/lib/db";

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
