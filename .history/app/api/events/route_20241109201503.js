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
  const newEvent = new Event(data);
  await newEvent.save();
  return new Response(JSON.stringify(newEvent), { status: 201 });
}
