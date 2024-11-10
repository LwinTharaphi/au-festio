// app/api/events/[id]/staffrole/[staffroleid]/route.js

import StaffRole from "@/models/Staffrole";
import dbConnect from "@/lib/db";

// GET: Fetch a specific staff role by staffroleid and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, staffroleid } =await params; // Event ID and Staff Role ID from URL parameters
  const role = await StaffRole.findOne({ _id: staffroleid, eventId: id });
  if (!role) {
    return new Response("Staff role not found", { status: 404 });
  }
  return new Response(JSON.stringify(role), { status: 200 });
}

// PUT: Update an existing staff role
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, staffroleid } = await params; // Event ID and Staff Role ID from URL parameters
  const data = await request.json();
  const updatedRole = await StaffRole.findOneAndUpdate(
    { _id: staffroleid, eventId: id }, // Find role by ID and event ID
    data,
    { new: true } // Return the updated document
  );
  if (!updatedRole) {
    return new Response("Staff role not found", { status: 404 });
  }
  return new Response(JSON.stringify(updatedRole), { status: 200 });
}

// DELETE: Delete a specific staff role
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, staffroleid } =await params; // Event ID and Staff Role ID from URL parameters
  const deletedRole = await StaffRole.findOneAndDelete({ _id: staffroleid, eventId: id });
  if (!deletedRole) {
    return new Response("Staff role not found", { status: 404 });
  }
  return new Response("Staff role deleted successfully", { status: 200 });
}
