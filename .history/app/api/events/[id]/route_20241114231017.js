import Event from "@/models/Event";
import dbConnect from "@/lib/db";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;
  console.log(id);
  try {
    const event = await Event.findById(id);
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    if (event && event.poster){
      const posterBase64 = event.poster.toString('base64');
      const eventWithPoster = {
        ...event.toObject(), // Spread the event data
        poster: `data:image/jpg;base64,${posterBase64}` // Add the poster data
      };
    
      return new Response(JSON.stringify(eventWithPoster), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const updatedData = await request.json();
  const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
  return new Response(JSON.stringify(updatedEvent), { status: 200 });
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  await Event.findByIdAndDelete(id);
  return new Response("Event deleted successfully", { status: 200 });
}
