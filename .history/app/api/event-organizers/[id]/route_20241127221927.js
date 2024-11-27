import Performance from "@/models/Performance";
import dbConnect from "@/lib/db";

// GET: Fetch a specific performance by performanceid and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, performanceid } = params; // Event ID and Performance ID from URL parameters
  const performance = await Performance.findOne({ _id: performanceid, eventId: id });
  
  if (!performance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response(JSON.stringify(performance), { status: 200 });
}

// PUT: Update an existing performance
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, performanceid } = await params; // Event ID and Performance ID from URL parameters
  const data = await request.json();
  
  const updatedPerformance = await Performance.findOneAndUpdate(
    { _id: performanceid, eventId: id }, // Find performance by ID and event ID
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
  const { id, performanceid } = await params; // Event ID and Performance ID from URL parameters
  
  const deletedPerformance = await Performance.findOneAndDelete({ _id: performanceid, eventId: id });
  
  if (!deletedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response("Performance deleted successfully", { status: 200 });
}
