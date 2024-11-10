//api for update and delete for each staff

import Staff from "@/models/Staff"; // Import your Staff model
import dbConnect from "@/lib/db";  // Database connection utility

// GET: Fetch a specific staff by staffid and event ID
export async function GET(request, { params }) {
  await dbConnect();
  
  const { id, staffid } =await params; // Event ID and Staff ID from URL parameters
  
  try {
    // Fetch the staff member by event ID and staff ID
    const staff = await Staff.findOne({ _id: staffid, event: id }).populate("role"); // Optionally populate role field
    
    if (!staff) {
      return new Response("Staff not found", { status: 404 });
    }
    
    // Return the staff member as response
    return new Response(JSON.stringify(staff), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error fetching staff", { status: 500 });
  }
}

// PUT: Update an existing staff member's details
export async function PUT(request, { params }) {
  await dbConnect();
  
  const { id, staffid } = await params; // Event ID and Staff ID from URL parameters
  const data = await request.json(); // Get the updated data from request body
  
  try {
    // Update the staff member's information by event ID and staff ID
    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: staffid, event: id }, // Find staff by ID and event ID
      data, // The updated staff data
      { new: true } // Return the updated document
    );
    
    if (!updatedStaff) {
      return new Response("Staff not found", { status: 404 });
    }
    
    // Return the updated staff member as response
    return new Response(JSON.stringify(updatedStaff), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error updating staff", { status: 500 });
  }
}

// DELETE: Delete a specific staff member
export async function DELETE(request, { params }) {
  await dbConnect();
  
  const { id, staffid } = await params; // Event ID and Staff ID from URL parameters
  
  try {
    // Delete the staff member by event ID and staff ID
    const deletedStaff = await Staff.findOneAndDelete({ _id: staffid, event: id });
    
    if (!deletedStaff) {
      return new Response("Staff not found", { status: 404 });
    }
    
    // Return a success message
    return new Response("Staff deleted successfully", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error deleting staff", { status: 500 });
  }
}
