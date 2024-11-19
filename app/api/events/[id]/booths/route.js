import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import { nanoid } from "nanoid"; // Import nanoid for unique boothId

// GET: Fetch all booths for a specific event
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID
  try {
    const booths = await Booth.find({ eventId: id });
    return new Response(JSON.stringify(booths), { status: 200 });
  } catch (error) {
    console.error("Error fetching booths:", error);
    return new Response("Error fetching booths", { status: 500 });
  }
}

// POST: Create a new booth for a specific event
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID

  try {
    const data = await req.json();
    const newBooth = new Booth({
      ...data,
      eventId: id,
      boothId: nanoid(10), // Automatically generate boothId
    });
    await newBooth.save();
    return new Response(JSON.stringify(newBooth), { status: 201 });
  } catch (error) {
    console.error("Error creating booth:", error);
    return new Response("Error creating booth", { status: 500 });
  }
}

// PUT: Update a specific booth
export async function PUT(req, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID
  const data = await req.json();

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
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID
  try {
    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });
    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}
