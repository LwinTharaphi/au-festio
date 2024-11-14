import Event from "@/models/Event";
import dbConnect from "@/lib/db";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params; // Await params here
  try {
    const event = await Event.findById(id);
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    if (event && event.poster) {
      const posterBase64 = event.poster.toString('base64');
      const eventWithPoster = {
        ...event.toObject(),
        poster: `data:image/jpg;base64,${posterBase64}`
      };
      return new Response(JSON.stringify(eventWithPoster), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    let updatedData;

    // Check if the content type is `multipart/form-data`
    if (request.headers.get("content-type").includes("multipart/form-data")) {
      const formData = await request.formData();
      updatedData = Object.fromEntries(formData);

      // Convert the `poster` if it's in base64 format
      if (updatedData.poster && updatedData.poster.startsWith("data:image/")) {
        updatedData.poster = Buffer.from(updatedData.poster.split(",")[1], "base64");
      }
    } else {
      // Handle JSON input
      updatedData = await request.json();
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedEvent), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params; // Await params here

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    return new Response("Event deleted successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
