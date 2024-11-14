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
   // Create a new formidable instance
   const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), "/public/uploads"), // Temporary upload folder
    keepExtensions: true, // Keep the original file extensions
    multiples: true, // Allow multiple file uploads
    maxFileSize: 10 * 1024 * 1024, // Set file size limit (e.g., 10MB)
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


// Handle the POST request for creating events and handling file uploads
export async function POST(req) {
  try {
    // Parse the form data (including file uploads) using formidable
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm({
        uploadDir: path.join(process.cwd(), "/public/uploads"), // Temporary upload folder
        keepExtensions: true, // Keep the original file extensions
        multiples: true, // Allow multiple file uploads
        maxFileSize: 10 * 1024 * 1024, // Set file size limit (e.g., 10MB)
      });

      // Parse the form data
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Extract event data and uploaded files
    const { eventName, location, organizerName, isPaid, venueName, latitude, longitude } = data.fields;
    const posterFile = data.files.poster ? data.files.poster[0] : null; // Assuming "poster" is the field name
    const qrCodeFile = data.files.qrCode ? data.files.qrCode[0] : null; // Assuming "qrCode" is the field name

    // Read the uploaded file buffers (for saving to MongoDB)
    const posterBuffer = posterFile ? fs.readFileSync(posterFile.filepath) : null;
    const qrCodeBuffer = qrCodeFile ? fs.readFileSync(qrCodeFile.filepath) : null;

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Prepare the event object for MongoDB
    const newEvent = {
      eventName,
      location,
      organizerName,
      isPaid: isPaid === "true", // Convert string to boolean if needed
      venueName,
      latitude,
      longitude,
      posterName: posterFile ? posterFile.originalFilename : null,
      poster: posterBuffer,
      qrCodeName: qrCodeFile ? qrCodeFile.originalFilename : null,
      qrCode: qrCodeBuffer,
    };

    // Create and save the event to MongoDB
    const event = new Event(newEvent);
    await event.save();

    // Respond with success
    return new Response(
      JSON.stringify({
        message: "Event created and files uploaded successfully",
        eventId: event._id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in event creation or file upload:", error);
    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 500 }
    );
  }
}