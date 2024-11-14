import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';

// Set `config` to disable body parsing, as formidable handles it
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse form data with formidable
const parseForm = async (req) => {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/uploads'), // Save files to 'uploads' directory temporarily
    keepExtensions: true, // Keep file extensions
    maxFileSize: 10 * 1024 * 1024, // Optional: Set max file size (e.g., 10MB)
    multiples: true, // Allow multiple file uploads if necessary
  });

  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      form.write(chunk);
    });

    req.on('end', () => {
      form.end();
    });

    form.on('error', (err) => {
      reject(err);
    });

    form.on('end', () => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
  });
};

export async function GET(request) {
  await dbConnect();
  const events = await Event.find();
  return new Response(JSON.stringify(events), { status: 200 });
}

// export async function POST(request) {
//   await dbConnect();
//   const data = await request.json();
//   const newEvent = new Event(data);
//   await newEvent.save();
//   return new Response(JSON.stringify(newEvent), { status: 201 });
// }


export async function POST(request) {
  try {
    // Convert the Next.js request to a compatible stream for formidable
    const req = request.body;

    // Parse form data
    const { fields, files } = await parseForm(req);
    const { eventName, location, organizerName, isPaid, venueName, latitude, longitude } = fields;
    
    const posterFile = files.poster ? files.poster[0] : null;
    const qrCodeFile = files.qrCode ? files.qrCode[0] : null;

    // Check if files were uploaded
    const posterBuffer = posterFile ? fs.readFileSync(posterFile.filepath) : null;
    const qrCodeBuffer = qrCodeFile ? fs.readFileSync(qrCodeFile.filepath) : null;

    // Connect to MongoDB
    const { db } = await dbConnect();

    // Create new event object
    const newEvent = {
      eventName,
      location,
      organizerName,
      isPaid,
      venueName,
      latitude,
      longitude,
      posterName: posterFile ? posterFile.originalFilename : null,
      poster: posterBuffer,
      qrCodeName: qrCodeFile ? qrCodeFile.originalFilename : null,
      qrCode: qrCodeBuffer,
    };

    // Insert event data into the database
    const event = new Event(newEvent);
    await event.save();

    // Send success response
    return NextResponse.json({ message: 'Event and files uploaded successfully', eventId: event._id });
  } catch (error) {
    console.error('Error in event creation or file upload:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
