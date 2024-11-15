import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import { uploadFile } from "../route";
import { NextResponse } from 'next/server';

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

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const formData = await request.formData();
    const eventName = formData.get("eventName");
    const location = formData.get("location");
    const isPaid = formData.get("isPaid") === "true";
    const venueName = formData.get("venueName");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");

    const poster = formData.get("poster");
    const price = formData.get('price')? Number(formData.get('price')): undefined;
    const seats = formData.get('seats')? Number(formData.get('seats')): undefined;
    const booths = formData.get('booths')? Number(formData.get('booths')): undefined;

    const updatedData = {
      eventName,
      location,
      isPaid,
      venueName,
      latitude,
      longitude,
      price,
      seats,
      booths,
    };

    if (poster) {
      updatedData.poster = await uploadFile(poster, "posters");
    }

    // Update the event with the new data
    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

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
