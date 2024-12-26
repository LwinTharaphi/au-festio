import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import { uploadFile } from "../route";
import { NextResponse } from 'next/server';
import generatePayload from "promptpay-qr";
import qrcode from 'qrcode';
import path from 'path';

export async function GET(request, { params }) {
  await dbConnect();
  const { organizer_id, id } = await params;

  try {
    const event = await Event.findOne({ organizer: organizer_id, _id: id });
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
  const { organizer_id, id } = await params;

  try {
    const formData = await request.formData();
    const eventName = formData.get("eventName");
    const registerationDate = formData.get("registerationDate");
    const eventDate = formData.get("eventDate");
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    const location = formData.get("location");
    const isPaid = formData.get("isPaid") === "true";
    const phone = isPaid? formData.get("phone"): null;
    const price = isPaid ? parseFloat(formData.get('price')) : null; // Parse price only if paid
    const discount = isPaid && formData.has('discount') 
      ? parseFloat(formData.get('discount')) 
      : 0;
    const isEarlyBirdValid = isPaid && formData.get(discount) && isEarlyBirdValid(registerationDate);
    const discountPrice = isEarlyBirdValid ? price - (price * discount)/100 : 0;
    const amount = isEarlyBirdValid ? discountPrice : price;
    console.log('Amount:', amount);
    let refundPolicy = [];
    if (isPaid && formData.has("refundPolicy")) {
      try {
        refundPolicy = JSON.parse(formData.get("refundPolicy"));
        console.log("Parsed refundPolicy:", refundPolicy);
      } catch (error) {
        console.error("Failed to parse refundPolicy:", error);
        refundPolicy = [];
      }
    }
    const venueName = formData.get("venueName");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");

    const poster = formData.get("poster");
    const posterName = formData.get("posterName");
    const seats = formData.get('seats')? Number(formData.get('seats')): undefined;

    const qrData = isPaid ? generatePayload(phone, { amount: amount }): null;
    const qrSvg = isPaid
      ? await qrcode.toString(qrData, { type: "svg", color: { dark: "#000", light: "#fff" } })
      : null;
    // Convert the SVG string into a Buffer (file-like object)
    const qrBuffer = qrSvg ? Buffer.from(qrSvg) : null;

    // Upload the QR code if it was generated
    const qrPath = qrBuffer ? await uploadFile(qrBuffer, "qrcodes") : null;

    const updatedData = {
      eventName,
      registerationDate,
      eventDate,
      startTime,
      endTime,
      location,
      isPaid,
      price,
      discount,
      refundPolicy: Array.isArray(refundPolicy) ? refundPolicy : [],
      venueName,
      latitude,
      longitude,
      seats,
      posterName,
      qrName: qrPath ? path.basename(qrPath) : null,
      qr: qrPath ? qrPath : null,
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
const isEarlyBirdValid = (registrationTimestamp) => {
  const now = new Date();
  const registrationDate = new Date(registrationTimestamp);
  const timeDifference = now - registrationDate; // in milliseconds
  const hoursPassed = timeDifference / (1000 * 60 * 60); // convert to hours

  return hoursPassed <= 24; // Early bird discount valid for 24 hours
};


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
