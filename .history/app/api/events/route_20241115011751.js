import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

// Set `config` to disable body parsing, as formidable handles it
export const config = {
  api: {
    bodyParser: false,
  },
};
// Decode binary base64 string to standard base64 string
const decodeBinaryToBase64 = (binaryData) => {
  if (binaryData && binaryData.$binary) {
    return `data:image/jpeg;base64,${binaryData.$binary.base64}`;
  }
  return ''; // Return empty if not found
};

export async function GET(request) {
  await dbConnect();
  const events = await Event.find();

  // Map through events to process the poster field
  const decodedEvents = events.map(event => {
    if (event.poster && event.poster.$binary) {
      event.poster = decodeBinaryToBase64(event.poster);  // Decode binary to base64
    }
    return event;
  });

  return new Response(JSON.stringify(decodedEvents), { status: 200 });
}



// Handle the POST request for creating events and handling file uploads
export async function POST(req) {
  try {
    // Parse form data (including files)
    const formData = await req.formData();

    // Extract form data fields
    const eventName = formData.get('eventName');
    const location = formData.get('location');
    const organizerName = formData.get('organizerName');
    const isPaid = formData.get('isPaid') === 'true'; // Convert to boolean if needed
    const venueName = formData.get('venueName');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');

    // Extract files from the form data
    const poster = formData.get('poster');
    const qrCode = formData.get('qrCode');

    // Handle file uploads (adjust to your specific storage strategy)
    const posterPath = poster ? await uploadFile(poster, 'posters') : null;
    const qrCodePath = qrCode ? await uploadFile(qrCode, 'qrCodes') : null;

    // Create event object
    const newEvent = {
      eventName,
      location,
      organizerName,
      isPaid,
      venueName,
      latitude,
      longitude,
      poster: posterPath,
      qrCode: qrCodePath,
      posterName: poster ? poster.name : null,
      qrCodeName: qrCode ? qrCode.name : null,
    };

    // Connect to your database and save the event
    await dbConnect(); // Ensure the dbConnect function is correctly set up
    const event = new Event(newEvent);
    await event.save();

    return NextResponse.json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// Helper function to upload a file (adjust to your specific storage solution)
async function uploadFile(file, folder) {
  if (!file) {
    return null;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', folder, file.name);
    await file.arrayBuffer().then(buffer => fs.writeFileSync(filePath, Buffer.from(buffer)));
    return filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null; // Or handle the error appropriately, e.g., return a default value or throw an exception
  }
}