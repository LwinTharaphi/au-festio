import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import formidable from "formidable";
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request) {
  await dbConnect();
  const events = await Event.find();
  return new Response(JSON.stringify(events), { status: 200 });
}

export async function POST(request) {
  await dbConnect();
  const form = new formidable.IncomingForm();
  
  const data = await request.json();
  const newEvent = new Event({
    ...data,
    poster: Buffer.from(data.poster, 'base64'),
    qrCode: data.qrCode ? Buffer.from(data.qrCode, 'base64') : null,
  });
  const savedEvent = await newEvent.save();
  console.log("Event saved: ",savedEvent);
  return new Response(JSON.stringify(savedEvent), { status: 201 });
}
