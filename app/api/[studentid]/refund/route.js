import Refund from "@/models/Refund";
import dbConnect from "@/lib/db";

// POST: Create a refund record for a student
export async function POST(request) {
  try {
    await dbConnect(); // Connect to the database

    const { studentId, refundPercentage } = await request.json(); // Get data from the request body

    if (!studentId || !refundPercentage) {
      return new Response(
        JSON.stringify({ message: "Missing required fields: studentId, eventId, refundPercentage" }),
        { status: 400 }
      );
    }

    // Create a new refund document
    const newRefund = new Refund({
      studentId,
      refundPercentage,
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
// Assuming you're using Next.js API routes
export async function GET(request, { params }) {
  try {
    await dbConnect(); // Connect to the database

    // Destructure both studentid and eventid from params
    const { studentid } = await params;
    console.log(`Searching for refund with studentId: ${studentid}`); // Log query

    // Query for refund using both studentId and eventId
    const refund = await Refund.findOne({ studentId: studentid });

    if (!refund) {
      return new Response(
        JSON.stringify({ message: "Refund record not found for this student and event" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        refundPercentage: refund.refundPercentage,
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
