import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";

// GET: Fetch a specific performance by organizerId and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { organizerId } = params; // Event ID and Performance ID from URL parameters
  const performance = await Performance.findOne({ _id: organizerId, eventId: id });
  
  if (!performance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response(JSON.stringify(performance), { status: 200 });
}

// PUT: Update an existing performance
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, organizerId } = await params; // Event ID and Performance ID from URL parameters
  const data = await request.json();
  
  const updatedPerformance = await Performance.findOneAndUpdate(
    { _id: organizerId, eventId: id }, // Find performance by ID and event ID
    data,
    { new: true } // Return the updated document
  );
  
  if (!updatedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response(JSON.stringify(updatedPerformance), { status: 200 });
}

// DELETE: Delete a specific performance
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, organizerId } = await params; // Event ID and Performance ID from URL parameters
  
  const deletedPerformance = await Performance.findOneAndDelete({ _id: organizerId, eventId: id });
  
  if (!deletedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response("Performance deleted successfully", { status: 200 });
}
