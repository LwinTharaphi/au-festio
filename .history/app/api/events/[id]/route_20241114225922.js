import Event from "@/models/Event";
import dbConnect from "@/lib/db";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    if (event && event.poster){
      const posterBase64 = event.poster.toString('base64');
      return new Response(JSON.stringify(
        ...event.toObject(),
        poster: `data:image/jpg;base64,${posterBase64}`
      ),{status: 200});
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const updatedData = await request.json();
  const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
  return new Response(JSON.stringify(updatedEvent), { status: 200 });
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  await Event.findByIdAndDelete(id);
  return new Response("Event deleted successfully", { status: 200 });
}
