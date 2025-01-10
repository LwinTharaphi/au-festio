import QRCode from "@/models/QRcode";
import dbConnect from "@/lib/db";

// POST: Save the QR code for a student
export async function POST(request) {
  try {
    await dbConnect(); // Connect to the database

    const { studentId, eventId, qrCodeData } = await request.json(); // Get the data from the request body

    if (!studentId || !eventId || !qrCodeData) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields: studentId, eventId, qrCodeData' }),
        { status: 400 }
      );
    }

    // Create a new QR code document
    const newQRCode = new QRCode({
      studentId,
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
