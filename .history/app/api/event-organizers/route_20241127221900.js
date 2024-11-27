import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";

// GET: Fetch all performances for a specific event
export async function GET() {
  await dbConnect();
  const organizers = await EventOrganizer.find(); // Fetch performances by event ID
  return new Response(JSON.stringify(organizers), { status: 200 });
}

// POST: Create a new performance for a specific event
export async function POST(request, { params }) {
  await dbConnect();
  const data = await request.json();
  const newOrganizer = new EventOrganizer({ ...data}); // Associate performance with event ID
  await newOrganizer.save();
  return new Response(JSON.stringify(newOrganizer), { status: 201 });
}
