import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";

// GET: Fetch a specific organizers by organizerId and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { organizerId } = params; // Event ID and Performance ID from URL parameters
  const organizers = await EventOrganizer.findOne({ _id: organizerId});
  
  if (!organizers) {
    return new Response("Organizers not found", { status: 404 });
  }

  return new Response(JSON.stringify(organizers), { status: 200 });
}

// PUT: Update an existing organizers
export async function PUT(request, { params }) {
  await dbConnect();
  const { organizerId } = await params; // Event ID and Performance ID from URL parameters
  const data = await request.json();
  
  const updatedOrganizers = await EventOrganizer.findOneAndUpdate(
    { _id: organizerId}, // Find organizers by ID and event ID
    data,
    { new: true } // Return the updated document
  );
  
  if (!updatedOrganizers) {
    return new Response("Organizers not found", { status: 404 });
  }

  return new Response(JSON.stringify(updatedOrganizers), { status: 200 });
}

// DELETE: Delete a specific organizers
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, organizerId } = await params; // Event ID and Performance ID from URL parameters
  
  const deletedPerformance = await Performance.findOneAndDelete({ _id: organizerId, eventId: id });
  
  if (!deletedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response("Performance deleted successfully", { status: 200 });
}
