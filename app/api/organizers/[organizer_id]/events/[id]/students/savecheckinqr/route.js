import QRCode from "@/models/QRcode";
import dbConnect from "@/lib/db";

// POST: Save the QR code for a student
export async function POST(request) {
  try {
    await dbConnect(); // Connect to the database

    const { studentId, eventId, firebaseUID, qrCodeData } = await request.json(); // Get the data from the request body

    if (!studentId || !eventId || !qrCodeData || !firebaseUID) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields: studentId, eventId, qrCodeData' }),
        { status: 400 }
      );
    }

    // Create a new QR code document
    const newQRCode = new QRCode({
      studentId,
      firebaseUID,
      eventId,
      qrCodeData,
    });

    // Save the QR code to the database
    await newQRCode.save();

    return new Response(
      JSON.stringify({ success: true, message: 'QR code saved successfully.' }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving QR code:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}


// GET: Retrieve the QR code for a specific student and event
export async function GET(request, { params }) {
  try {
    await dbConnect(); // Connect to the database

    const { studentid, eventid } = params; // Get studentId and eventId from URL parameters

    const qrCode = await QRCode.findOne({ studentId: studentid, eventId: eventid });

    if (!qrCode) {
      return new Response(
        JSON.stringify({ message: 'QR code not found for this student and event' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ qrCodeData: qrCode.qrCodeData }), // Return the QR code data
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving QR code:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
