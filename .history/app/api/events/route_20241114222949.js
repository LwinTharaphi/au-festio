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

// Function to parse the form data (this handles both fields and files)
const parseFormData = (req) => {
  return new Promise((resolve, reject) => {
    const formData = { fields: {}, files: {} };

    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const form = new FormData();
      form.append('data', buffer);

      // Parse the form data
      // You can implement additional logic here for handling file streams
      resolve(formData);
    });

    req.on('error', (err) => reject(err));
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