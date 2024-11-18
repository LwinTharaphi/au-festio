import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";

// GET: Fetch all booths for a specific event
export async function GET(request, { params }) {
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
    const { id } = await params; // Event ID from the URL
  
    try {
      const data = await req.json();
      const newBooth = new Booth({
        ...data,
        eventId: id, // Associate the booth with the event
      });
      await newBooth.save();
      return new Response(JSON.stringify(newBooth), { status: 201 });
    } catch (error) {
      console.error("Error creating booth:", error);
      return new Response(JSON.stringify({ message: "Error creating booth" }), {
        status: 500,
      });
    }
  }
  
