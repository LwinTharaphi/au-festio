import Event from "@/models/Event";
import dbConnect from "@/lib/db";

export async function GET(request) {
  await dbConnect();
  const events = await Event.find();
  return new Response(JSON.stringify(events), { status: 200 });
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const newEvent = new Event({
    ...data,
    poster: Buffer.from(data.poster),
    qrCode: data.qrCode ? Buffer.from(data.qrCode) : null,
  });
  const savedEvent = await newEvent.save();
  console.log("Event saved: ",savedEvent);
  return new Response(JSON.stringify(savedEvent), { status: 201 });
}
