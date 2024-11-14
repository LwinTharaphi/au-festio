// app/api/events/upload/route.js

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import dbConnect from "@/lib/db";

// Set `config` to disable body parsing, as formidable handles it
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse form data with formidable
const parseForm = async (req) => {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/uploads'), // Save files to a directory named 'uploads'
    keepExtensions: true, // Keep the file extension
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export async function POST(req) {
  try {
    // Parse form data
    const { fields, files } = await parseForm(req);
    const { eventName, organizerName, isPaid } = fields;
    const posterFile = files.poster ? files.poster[0] : null;
    const qrCodeFile = files.qrCode ? files.qrCode[0] : null;

    // Check if files were uploaded
    const posterPath = posterFile ? `/uploads/${posterFile.newFilename}` : null;
    const qrCodePath = qrCodeFile ? `/uploads/${qrCodeFile.newFilename}` : null;

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Insert event data into the database
    const newEvent = {
      eventName,
      organizerName,
      isPaid,
      posterPath,
      qrCodePath,
    };
    const result = await db.collection('events').insertOne(newEvent);

    // Send success response
    return new Response(JSON.stringify({ message: 'File uploaded successfully', eventId: result.insertedId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    return new Response(JSON.stringify({ message: 'Error uploading file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
