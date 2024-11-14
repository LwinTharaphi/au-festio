import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Utility to convert the request into a readable stream
const requestToStream = async (request) => {
  const arrayBuffer = await request.arrayBuffer();
  return Readable.from(Buffer.from(arrayBuffer));
};

// GET - Fetch all events from the database
export async function GET(request) {
  await dbConnect();
  const events = await Event.find();
  return new Response(JSON.stringify(events), { status: 200 });
}

// POST - Create a new event with file upload
export async function POST(request) {
  await dbConnect();

  const uploadDir = path.join(process.cwd(), 'public/uploads'); // Save files in the 'public/uploads' directory
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
  })

  const fileParse = new Promise(async (resolve, reject) => {
    const stream = await requestToStream(request);
    form.parse(request, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });

  try {
    const { fields, files } = await fileParse;
    
    // Assuming the file input field is 'poster' and 'qrCode'
    const posterPath = files.poster ? `/uploads/${files.poster.newFilename}` : '';
    const qrCodePath = files.qrCode ? `/uploads/${files.qrCode.newFilename}` : '';

    // Create a new Event document in MongoDB
    const newEvent = new Event({
      eventName: fields.eventName,
      location: fields.location,
      venueName: fields.venueName,
      latitude: fields.latitude,
      longitude: fields.longitude,
      organizerName: fields.organizerName,
      isPaid: fields.isPaid[0] === 'true', // Ensure it's a boolean
      posterName: fields.posterName,
      qrCodeName: fields.qrCodeName,
      poster: posterPath,  // Store the file path in the DB
      qrCode: qrCodePath,  // Store the file path for the QR code
    });

    const savedEvent = await newEvent.save();
    console.log("Event saved:", savedEvent);
    
    return new Response(JSON.stringify(savedEvent), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'File upload failed', error }), {
      status: 500,
    });
  }
}
