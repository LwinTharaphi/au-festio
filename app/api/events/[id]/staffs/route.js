import Staff from "@/models/Staff"; // Import your Staff model
import dbConnect from "@/lib/db"; // Database connection utility

// GET: Fetch all staff for a specific event
export async function GET(request, { params }) {
  await dbConnect();
  
  // Retrieve the event ID from URL parameters
  const { id } = await params; // Event ID from URL parameters
  
  try {
    // Fetch all staff associated with the event
    const staff = await Staff.find({ event: id }).populate("role"); // Optionally populate role field

    // Return the list of staff
    return new Response(JSON.stringify(staff), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error fetching staff" }), { status: 500 });
  }
}

// POST: Create a new staff member for a specific event
export async function POST(request, { params }) {
  await dbConnect();

  // Retrieve event ID from URL parameters
  const { id } = await params; // Event ID from URL parameters
  
  try {
    // Get staff data from request body
    const data = await request.json();

    // Create a new staff member with the provided data and associate it with the event
    const newStaff = new Staff({
      ...data,
      event: id, // Set the event ID for the staff member
    });

    // Save the new staff member to the database
    await newStaff.save();

    // Return the newly created staff member as response
    return new Response(JSON.stringify(newStaff), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error creating staff" }), { status: 500 });
  }
}
