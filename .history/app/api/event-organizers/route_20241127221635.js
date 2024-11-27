import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";

// GET: Fetch all performances for a specific event
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID from URL parameters
  const performances = await EventOrganizer.find({ eventId: id }); // Fetch performances by event ID
  return new Response(JSON.stringify(performances), { status: 200 });
}

// POST: Create a new performance for a specific event
export async function POST(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID from URL parameters
  const data = await request.json();
  const newPerformance = new Performance({ ...data, eventId: id }); // Associate performance with event ID
  await newPerformance.save();
  return new Response(JSON.stringify(newPerformance), { status: 201 });
}
