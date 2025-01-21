import Refund from "@/models/Refund";
import dbConnect from "@/lib/db";

// POST: Create a refund record for a student
export async function POST(request) {
  try {
    await dbConnect(); // Connect to the database

    const { studentId, eventId, refundPercentage, qrImage } = await request.json(); // Get data from the request body

    if (!studentId || !eventId || !refundPercentage || !qrImage) {
      return new Response(
        JSON.stringify({ message: "Missing required fields: studentId, eventId, refundPercentage, qrImage" }),
        { status: 400 }
      );
    }

    // Create a new refund document
    const newRefund = new Refund({
      studentId,
      eventId,
      refundPercentage,
      qrImage,
    });

    // Save the refund record to the database
    await newRefund.save();

    return new Response(
      JSON.stringify({ success: true, message: "Refund record created successfully." }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating refund record:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

// GET: Retrieve refund details for a specific student and event
export async function GET(request, { params }) {
  try {
    await dbConnect(); // Connect to the database

    const { studentid, eventid } = params; // Get studentId and eventId from URL parameters

    const refund = await Refund.findOne({ studentId: studentid, eventId: eventid });

    if (!refund) {
      return new Response(
        JSON.stringify({ message: "Refund record not found for this student and event" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        refundPercentage: refund.refundPercentage,
        qrImage: refund.qrImage,
      }), // Return refund details
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving refund record:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
