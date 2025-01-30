import dbConnect from "@/lib/db";
import QRCode from "@/models/QRcode";
import Event from "@/models/Event";
import Student from "@/models/Student";

// GET: Retrieve the QR code for a specific event
export async function GET(request, { params }) {
  try {
    await dbConnect(); // Connect to the database

    const { organizer_id, id } = params; // Get eventId from URL parameters

    const { searchParams } = new URL(request.url); // Get the search parameters from the request URL
    const studentId = searchParams.get('studentId'); // Get studentId from the search parameters
    const firebaseUID = searchParams.get('firebaseUID'); // Get firebaseUID from the search parameters

    if (!studentId || !firebaseUID) {
      return new Response(
        JSON.stringify({ message: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    const event = await Event.findOne({ _id: id, organizer: organizer_id });

    if (!event) {
      return new Response(
        JSON.stringify({ message: 'Event not found' }),
        { status: 404 }
      );
    }

    const student = await Student.findOne({ _id: studentId, firebaseUID });

    if (!student) {
      return new Response(
        JSON.stringify({ message: 'Student not found' }),
        { status: 404 }
      );
    }

    const qrCode = await QRCode.findOne({ studentId: studentId,eventId: id });

    if (!qrCode) {
      return new Response(
        JSON.stringify({ message: 'QR code not found for this event' }),
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