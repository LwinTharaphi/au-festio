import QRCode from "@/models/QRcode";
import dbConnect from "@/lib/db";

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
