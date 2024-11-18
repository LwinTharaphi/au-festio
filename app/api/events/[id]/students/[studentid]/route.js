import Student from "@/models/Student";
import dbConnect from "@/lib/db";

// GET: Fetch a specific student by student ID and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  const student = await Student.findOne({ _id: studentid, eventId: id });
  
  if (!student) {
    return new Response("Student not found", { status: 404 });
  }

  return new Response(JSON.stringify(student), { status: 200 });
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
  
  const deletedStudent = await Student.findOneAndDelete({ _id: studentid, eventId: id });
  
  if (!deletedStudent) {
    return new Response("Student not found", { status: 404 });
  }

  return new Response("Student deleted successfully", { status: 200 });
}
