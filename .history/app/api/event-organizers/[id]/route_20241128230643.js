import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";
import { encrypt, decrypt } from "../route";

// GET: Fetch a specific organizers by id and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID and Performance ID from URL parameters
  const organizers = await EventOrganizer.findOne({ _id: id});
  
  if (!organizers) {
    return new Response("Organizers not found", { status: 404 });
  }

  // Decrypt password before returning
  const decryptedPassword = decrypt(`${organizer.iv}:${organizer.password}`);
  const responseData = {
    ...organizers.toObject(),
    password: decryptedPassword, // Replace encrypted password with decrypted one
  };

  return new Response(JSON.stringify(organizers), { status: 200 });
}

// PUT: Update an existing organizers
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    // Ensure database connection
    await dbConnect();

    // Extract ID from URL parameters
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Organizer ID is required" }),
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // If the password field exists, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Update the organizer document
    const updatedOrganizer = await EventOrganizer.findByIdAndUpdate(
      id,           // Match the document by ID
      data,         // Update fields with the provided data
      { new: true } // Return the updated document
    );

    // Handle case where organizer is not found
    if (!updatedOrganizer) {
      return new Response(
        JSON.stringify({ error: "Organizer not found" }),
        { status: 404 }
      );
    }

    // Return the updated document
    return new Response(JSON.stringify(updatedOrganizer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT API:", error); // Log the error for debugging
    return new Response(
      JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
      { status: 500 }
    );
  }
}


// DELETE: Delete a specific organizers
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID and Performance ID from URL parameters
  console.log(id)
  
  const deletedOrganizers = await EventOrganizer.findByIdAndDelete(id);
  
  if (!deletedOrganizers) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response("Performance deleted successfully", { status: 200 });
}
