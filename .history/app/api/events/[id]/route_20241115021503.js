import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import { uploadFile } from "../route";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(event), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// export async function PUT(request, { params }) {
//   await dbConnect();
//   const { id } = await params;

//   try {
//     let updatedData;

//     // Check if the content type is `multipart/form-data`
//     if (request.headers.get("content-type").includes("multipart/form-data")) {
//       const formData = await request.formData();
//       updatedData = Object.fromEntries(formData);

//       // Check and convert the poster if it's in Base64 format
//       if (updatedData.poster && updatedData.poster.startsWith("data:image/")) {
//         // Ensure we only capture the base64 portion of the string
//         const base64String = updatedData.poster.split(",")[1];
//         if (!base64String) {
//           return new Response(JSON.stringify({ error: "Invalid Base64 image data" }), { status: 400 });
//         }
//         updatedData.poster = Buffer.from(base64String, "base64");
//       }
//     } else {
//       // Handle JSON input if no file is uploaded
//       updatedData = await request.json();
//     }

//     const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
//     if (!updatedEvent) {
//       return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
//     }

//     return new Response(JSON.stringify(updatedEvent), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
//   }
// }

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const formData = await request.formData();
    const event = await Event.findById(id);

    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    // Update fields
    const eventName = formData.get("eventName");
    const location = formData.get("location");
    const organizerName = formData.get("organizerName");
    const isPaid = formData.get("isPaid") === "true";
    const venueName = formData.get("venueName");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");

    const poster = formData.get("poster");
    const qrCode = formData.get("qrCode");

    if (poster) {
      event.poster = await uploadFile(poster, "posters");
    }

    if (qrCode) {
      event.qrCode = await uploadFile(qrCode, "qrCodes");
    }

    // Update the event with new data
    event.eventName = eventName;
    event.location = location;
    event.organizerName = organizerName;
    event.isPaid = isPaid;
    event.venueName = venueName;
    event.latitude = latitude;
    event.longitude = longitude;

    await event.save();

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
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
