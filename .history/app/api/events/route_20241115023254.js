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
const decodeBase64Binary = (binaryData) => {
  const base64String = binaryData.toString('base64');
  return `data:image/jpg;base64,${base64String}`; // Assuming the image is a jpeg
};

export async function GET(request) {
  await dbConnect();
  const events = await Event.find();

  // Map through events to process the poster field
  const eventsWithPoster = events.map(event => {
    // Log the entire event object to check its structure
    console.log('Event:', event);

     // Check if 'poster' exists in the event
     const posterPath = event.poster; // The relative path stored in the database
     if (!posterPath) {
       console.log('No poster found for event:', event._id);
     } else {
       console.log('Poster Path:', posterPath);
     }
 
     // Construct the full URL based on the relative path stored in the database
     const posterUrl = `http://localhost:3000/${posterPath}`; // Use your server URL here
 
     console.log('Poster URL:', posterUrl);
 
     return {
       ...event.toObject(),
       poster: posterUrl, // Attach the URL to the poster field
     };
  });

  return new Response(JSON.stringify(eventsWithPoster), { status: 200 });
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
export async function uploadFile(file, folder) {
  if (!file) {
    return null;
  }

  try {
    // Define the directory where the file will be stored
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    // Ensure the directory exists, create it if necessary
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Construct the full path for the file
    const filePath = path.join(uploadDir, file.name);

    // Save the file to the disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    // Return the relative path (you can later use this for URLs or DB storage)
    return `uploads/${folder}/${file.name}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null; // Or handle the error appropriately
  }
}