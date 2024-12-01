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
  const decryptedPassword = decrypt(`${organizers.iv}:${organizers.password}`);
  const responseData = {
    ...organizers.toObject(),
    password: decryptedPassword, // Replace encrypted password with decrypted one
  };

  return new Response(JSON.stringify(responseData), { status: 200 });
}

// PUT: Update an existing organizers
export async function PUT(request, { params }) {
  try {
    // Ensure database connection
    await dbConnect();

    // Extract ID from URL parameters
    const { id } = await params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Organizer ID is required" }),
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Fetch the organizer from the database
    const organizer = await EventOrganizer.findById(id);
    if (!organizer) {
      return new Response(
        JSON.stringify({ error: "Organizer not found" }),
        { status: 404 }
      );
    }

    // Check if password update is requested
    if (data.currentPassword && data.newPassword && data.confirmPassword) {
      // Password update logic
      if (data.newPassword !== data.confirmPassword) {
        return new Response(
          JSON.stringify({ error: "New password and confirmation do not match" }),
          { status: 400 }
        );
      }

      // Decrypt the stored password
      const decryptedPassword = decrypt(`${organizer.iv}:${organizer.password}`);

      // Verify the current password (decrypted)
      if (decryptedPassword !== data.currentPassword) {
        return new Response(
          JSON.stringify({ error: "Current password is incorrect" }),
          { status: 400 }
        );
      }

      // Encrypt the new password before saving it
      const encrypted = encrypt(data.newPassword);
      data.password = encrypted.split(":")[1];
      data.iv = encrypted.split(":")[0];
    } else {
      // Retain the existing password and iv if no password update is requested
      data.password = organizer.password;
      data.iv = organizer.iv;
    }

    // Update the organizer document
    const updatedOrganizer = await EventOrganizer.findByIdAndUpdate(
      id,
      data,
      { new: true }
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
    console.error("Error in PUT API:", error);
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
