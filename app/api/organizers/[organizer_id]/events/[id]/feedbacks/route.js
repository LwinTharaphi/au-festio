import Feedback from "@/models/Feedback";
import dbConnect from "@/lib/db";

// GET: Fetch all feedbacks for a specific event
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID from URL parameters
  const feedbacks = await Feedback.find({ eventId: id }); // Fetch feedbacks by event ID
  return new Response(JSON.stringify(feedbacks), { status: 200 });
}

// POST: Create a new feedback for a specific event
export async function POST(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID from URL parameters
  const data = await request.json();
  const newFeedback = new Feedback({ ...data, eventId: id }); // Associate feedback with event ID
  await newFeedback.save();
  return new Response(JSON.stringify(newFeedback), { status: 201 });
}
