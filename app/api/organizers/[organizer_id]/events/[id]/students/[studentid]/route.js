import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import { deleteBoothFile } from "../../booths/route";
const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
// GET: Fetch a specific student by student ID and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  const student = await Student.findOne({ _id: studentid, eventId: id });
  
  if (!student) {
    return new Response("Student not found", { status: 404 });
  }
  const paymentScreenshotUrl = `${baseS3Url}${student.paymentScreenshotUrl}`;
  const refundQRCode = `${baseS3Url}${student.refundQRCode}`;
  return new Response(JSON.stringify({...student.toObject(), paymentScreenshotUrl: paymentScreenshotUrl, refundQRCode: refundQRCode}), { status: 200 });
}

export async function POST(request, { params }) {
  await dbConnect(); // Connect to the database

  const { id: eventId, studentid: studentId } = params;

  try {
    // Find the student by ID
    const student = await Student.findOne({ _id: studentId, eventId: eventId });

    if (!student) {
      return new Response(
        JSON.stringify({ message: 'Student not found for this event' }),
        { status: 404 }
      );
    }

    // Check if the student has already checked in
    if (student.checkInStatus === 'checked-in') {
      return new Response(
        JSON.stringify({ message: 'This student has already checked in.' }),
        { status: 400 }
      );
    }

    // Update the student's check-in status
    student.checkInStatus = 'checked-in';
    await student.save();

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Student checked-in successfully.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating check-in status:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

// PUT: Update an existing student
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  const data = await request.json();
  
  const updatedStudent = await Student.findOneAndUpdate(
    { _id: studentid, eventId: id }, // Find student by ID and event ID
    data,
    { new: true } // Return the updated document
  );
  
  if (!updatedStudent) {
    return new Response("Student not found", { status: 404 });
  }

  return new Response(JSON.stringify(updatedStudent), { status: 200 });
}

// DELETE: Delete a specific student
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  
  const studentToDelete = await Student.findOne({ _id: studentid, eventId: id });
  if(!studentToDelete) {
    return new Response("Student not found", { status: 404 });
  }
  if(studentToDelete.paymentScreenshotUrl) {
    await deleteBoothFile(studentToDelete.paymentScreenshotUrl);
    await deleteBoothFile(studentToDelete.refundQRCode);
  }
  const deletedStudent = await Student.findOneAndDelete({ _id: studentid, eventId: id });
  
  if (!deletedStudent) {
    return new Response("Student not found", { status: 404 });
  }

  return new Response("Student deleted successfully", { status: 200 });
}
