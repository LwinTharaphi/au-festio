import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";

// GET: Fetch a specific booth by boothId
export async function GET(request, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID
  try {
    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });
    return new Response(JSON.stringify(booth), { status: 200 });
  } catch (error) {
    console.error("Error fetching booth:", error);
    return new Response("Error fetching booth", { status: 500 });
  }
}

// PUT: Update a specific booth
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID
  const data = await request.json();
  try {
    const updatedBooth = await Booth.findOneAndUpdate(
      { boothId: boothid, eventId: id },
      data,
      { new: true }
    );
    if (!updatedBooth) return new Response("Booth not found", { status: 404 });
    return new Response(JSON.stringify(updatedBooth), { status: 200 });
  } catch (error) {
    console.error("Error updating booth:", error);
    return new Response("Error updating booth", { status: 500 });
  }
}

// DELETE: Delete a specific booth
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID
  try {
    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });
    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}