//api for update and delete for each student
import Student from "@/models/Student"; // Import your Student model
import dbConnect from "@/lib/db";  // Database connection utility

// GET: Fetch a specific student by studentid and event ID
export async function GET(request, { params }) {
  await dbConnect();
  
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  
  try {
    // Fetch the student by event ID and student ID
    const student = await Student.findOne({ _id: studentid, event: id }).populate("course"); // Optionally populate course field
    
    if (!student) {
      return new Response("Student not found", { status: 404 });
    }
    
    // Return the student as response
    return new Response(JSON.stringify(student), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error fetching student", { status: 500 });
  }
}

// PUT: Update an existing student's details
export async function PUT(request, { params }) {
  await dbConnect();
  
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  const data = await request.json(); // Get the updated data from request body
  
  try {
    // Update the student's information by event ID and student ID
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: studentid, event: id }, // Find student by ID and event ID
      data, // The updated student data
      { new: true } // Return the updated document
    );
    
    if (!updatedStudent) {
      return new Response("Student not found", { status: 404 });
    }
    
    // Return the updated student as response
    return new Response(JSON.stringify(updatedStudent), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error updating student", { status: 500 });
  }
}

// DELETE: Delete a specific student
export async function DELETE(request, { params }) {
  await dbConnect();
  
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  
  try {
    // Delete the student by event ID and student ID
    const deletedStudent = await Student.findOneAndDelete({ _id: studentid, event: id });
    
    if (!deletedStudent) {
      return new Response("Student not found", { status: 404 });
    }
    
    // Return a success message
    return new Response("Student deleted successfully", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error deleting student", { status: 500 });
  }
}
