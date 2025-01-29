import dbConnect from "@/lib/db";
import QRCode from "@/models/QRcode";
import Event from "@/models/Event";

// GET: Retrieve the QR code for a specific event
export async function GET(request, { params }) {
  try {
    await dbConnect(); // Connect to the database

    const { organizer_id, id } = params; // Get eventId from URL parameters

    const event = await Event.findOne({ _id: id, organizer: organizer_id });

    if (!event) {
      return new Response(
        JSON.stringify({ message: 'Event not found' }),
        { status: 404 }
      );
    }

    const qrCode = await QRCode.findOne({ eventId: id });

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