import Event from "@/models/Event";
import dbConnect from "@/lib/db";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const event = await Event.findById(id).lean(); // Use lean() to get a plain object directly
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    if (event.poster) {
      const posterBase64 = event.poster.toString('base64');
      event.poster = `data:image/jpg;base64,${posterBase64}`; // Embed poster as base64 data URL
    }

    return new Response(JSON.stringify(event), { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const updatedData = await request.json();

    // Convert poster field back to Buffer if it is provided as a base64 string
    if (updatedData.poster && updatedData.poster.startsWith("data:image/")) {
      const base64Data = updatedData.poster.split(",")[1];
      updatedData.poster = Buffer.from(base64Data, "base64");
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedEvent), { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: "Event deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
