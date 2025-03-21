import Event from "@/models/Event";
import dbConnect from "@/lib/db";
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import generatePayload from "promptpay-qr";
import qrcode from 'qrcode';
import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// Set `config` to disable body parsing, as formidable handles it
export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

export async function GET(request,{ params }) {
  const db = await dbConnect();
  const { organizer_id } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;

  const skip = (page - 1) * limit;

  const events = await Event.find({organizer: organizer_id})
        .sort({eventDate: 1}).skip(skip);
  const totalEvents = await Event.countDocuments({organizer: organizer_id});

  // Map through events to process the poster field
  const eventsWithPoster = events.map(event => {
    // Log the entire event object to check its structure
    // console.log('Event:', event);

     // Check if 'poster' exists in the event
     const posterPath = Buffer.from(event.poster,'base64').toString('utf-8'); // The relative path stored in the database
     if (!posterPath) {
       console.log('No poster found for event:', event._id);
     } else {
       console.log('There is a Poster Path:');
     }

    //  const qrPath = event.qr;
    //  if(!qrPath){
    //   console.log('No qr found for event:',event._id);
    //  } else {
    //   console.log('There is a QR Path:');
    //  }
 
     // Construct the full URL based on the relative path stored in the database
     const posterUrl = `${baseS3Url}${posterPath}`; // Use your server URL here
 
     return {
       ...event.toObject(),
       poster: posterUrl, // Attach the URL to the poster field
      //  qr: qrUrl,
     };
  });
  const totalPages = Math.ceil(totalEvents / limit);
  const metadata = {
    totalEvents,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    limit,
  };

  return new Response(JSON.stringify({events: eventsWithPoster,metadata}), { status: 200 });
}



// Handle the POST request for creating events and handling file uploads
export async function POST(req,{ params}) {
  // Connect to your database and save the event
  await dbConnect(); // Ensure the dbConnect function is correctly set up
  const { organizer_id } = await params;
  try {
    // Parse form data (including files)
    const formData = await req.formData();

    // Extract form data fields
    const eventName = formData.get('eventName');
    const registerationDate = formData.get('registerationDate');
    const eventDate = formData.get('eventDate');
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const location = formData.get('location');
    const isPaid = formData.get('isPaid') === 'true'; // Convert to boolean if needed
    const phone = isPaid? formData.get('phone'): null;
    const price = isPaid ? parseFloat(formData.get('price')) : null; // Parse price only if paid
    const discount = isPaid && formData.has('discount') 
      ? parseFloat(formData.get('discount')) 
      : 0;
    // const isEarlyBirdValid = isPaid && formData.has('discount') && isEarlyBirdValid(registerationDate);
    // const discountPrice = isEarlyBirdValid ? price - (price * discount)/100 : 0;
    // const amount = isEarlyBirdValid ? discountPrice : price;
    // console.log('Amount:', amount);
    let refundPolicy = [];
    if (isPaid && formData.has("refundPolicy")) {
      try {
        refundPolicy = JSON.parse(formData.get("refundPolicy"));
        console.log("Parsed refundPolicy:", refundPolicy);
      } catch (error) {
        console.error("Failed to parse refundPolicy:", error);
        refundPolicy = [];
      }
    }
    const venueName = formData.get('venueName');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');

    // Extract files from the form data
    const poster = formData.get('poster');

    // Handle file uploads (adjust to your specific storage strategy)
    const posterPath = poster ? await uploadFile(poster, 'posters') : null;
    // console.log('Poster Path:', posterPath);
    const seats = formData.get('seats')? Number(formData.get('seats')): undefined;

    // Validation for paid events
    if (isPaid && (price === null || price <= 0)) {
      return NextResponse.json({ error: 'Price is required for paid events and must be greater than 0' }, { status: 400 });
    }
    if (isPaid && (discount < 0 || discount > 100)) {
      return NextResponse.json({ error: 'Discount must be between 0 and 100' }, { status: 400 });
    }

    // const qrData = isPaid ? generatePayload(phone, { amount: amount }): null;
    // console.log('QR Data:', qrData);
    // const qrSvg = isPaid
    //   ? await qrcode.toString(qrData, { type: "svg", color: { dark: "#000", light: "#fff" } })
    //   : null;
    // console.log('QR SVG:', qrSvg);
    // // Convert the SVG string into a Buffer (file-like object)
    // const qrBuffer = qrSvg ? Buffer.from(qrSvg) : null;

    // // Upload the QR code if it was generated
    // const qrPath = qrBuffer ? await uploadFile(qrBuffer, "qrcodes") : null;
    // console.log('QR Path:', qrPath);

    // Create event object
    const newEvent = {
      organizer: organizer_id,
      eventName,
      registerationDate,
      eventDate,
      startTime,
      endTime,
      location,
      isPaid,
      price,
      discount,
      refundPolicy: Array.isArray(refundPolicy) ? refundPolicy : [],
      venueName,
      latitude,
      longitude,
      poster: posterPath,
      posterName: poster ? poster.name : null,
      // qr: qrPath,
      // qrName: qrPath ? path.basename(qrPath) : null,
      seats,
      phone,
    };
    if (isPaid) {
      newEvent.refundStatus = 'none';
    }
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

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(folder, fileName).replace(/\\/g, '/'); // Replace backslashes with forward slashes
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filePath,
    Body: file instanceof Buffer ? file: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type || 'application/octet-stream',
    CacheControl: 'max-age=31536000',
  };

  try{
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log('File uploaded successfully', fileName);
    const fileUrl = `${filePath}`;
    // console.log('File URL:', fileUrl);
    return fileUrl;
  } catch (error){
    console.error('Error uploading file:', error);
    return null;
  }

  // try {
  //   // Define the directory where the file will be stored
  //   const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

  //   // Ensure the directory exists, create it if necessary
  //   await fs.promises.mkdir(uploadDir, { recursive: true });

  //   let fileName;
  //   let filePath;

  //   // Handle user-uploaded files (posters) which come with .name
  //   if (file instanceof Buffer) {
  //     // For the QR code or other raw data, generate a unique name and path
  //     fileName = `qr-code-${Date.now()}.svg`; // Example for QR code
  //     filePath = path.join(uploadDir, fileName);
  //     await fs.promises.writeFile(filePath, file);
  //   } else {
  //     // For user-uploaded files (e.g., poster), use the file's original name
  //     fileName = file.name;
  //     filePath = path.join(uploadDir, fileName);

  //     // If the file is a user-uploaded file, move it from temp storage to final location
  //     const buffer = Buffer.from(await file.arrayBuffer()); // Convert Blob to Buffer
  //     await fs.promises.writeFile(filePath, buffer); // Write the content to the final destination
  //   }

  //   // Return the relative path (you can later use this for URLs or DB storage)
  //   return `uploads/${folder}/${fileName}`;
  // } catch (error) {
  //   console.error('Error uploading file:', error);
  //   return null; // Or handle the error appropriately
  // }
}

// const isEarlyBirdValid = (registrationTimestamp) => {
//   const now = new Date();
//   const registrationDate = new Date(registrationTimestamp);
//   const timeDifference = now - registrationDate; // in milliseconds
//   const hoursPassed = timeDifference / (1000 * 60 * 60); // convert to hours

//   return hoursPassed <= 24; // Early bird discount valid for 24 hours
// };
