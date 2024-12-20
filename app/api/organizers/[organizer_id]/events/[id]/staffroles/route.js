import StaffRole from "@/models/Staffrole";
import dbConnect from "@/lib/db";

// GET: Fetch all staff roles for a specific event
export async function GET(request, { params }) {
  await dbConnect();
  // Await params before accessing id
  const { id } = await params; // Event ID from URL parameters
  const roles = await StaffRole.find({ eventId: id }); // Fetch roles by event ID
  return new Response(JSON.stringify(roles), { status: 200 });
}

// POST: Create a new staff role for a specific event
export async function POST(request, { params }) {
  await dbConnect();
  // Await params before accessing id
  const { id } = await params; // Event ID from URL parameters
  const data = await request.json();
  const newRole = new StaffRole({ ...data, eventId: id }); // Associate role with event ID
  await newRole.save();
  return new Response(JSON.stringify(newRole), { status: 201 });
}
