import EventOrganizer from "@/models/EventOrganizer";
import dbConnect from "@/lib/db";
import { encrypt, decrypt } from "../route";

export async function PUT(request) {
  try {
    await dbConnect(); // Connect to the database

    const { newPassword, confirmPassword } = await request.json();

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: "Both password fields are required" }),
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: "New password and confirmation do not match" }),
        { status: 400 }
      );
    }

    // Assuming otpEmail is available from the session or previous request context
    const otpEmail = request.headers.get('otp-email');  // Retrieve email from the headers

    if (!otpEmail) {
      return new Response(
        JSON.stringify({ error: "Email not found. Please verify your identity." }),
        { status: 400 }
      );
    }

    // Find the organizer by email
    const organizer = await EventOrganizer.findOne({ email: otpEmail });
    if (!organizer) {
      return new Response(
        JSON.stringify({ error: "Organizer not found" }),
        { status: 404 }
      );
    }

    // Encrypt the new password
    const encrypted = encrypt(newPassword);
    const password = encrypted.split(":")[1];
    const iv = encrypted.split(":")[0];

    // Update the password in the database
    const updatedOrganizer = await EventOrganizer.findOneAndUpdate(
      { email: otpEmail },
      { password, iv },
      { new: true }
    );

    if (!updatedOrganizer) {
      return new Response(
        JSON.stringify({ error: "Error updating the password" }),
        { status: 500 }
      );
    }

    // Return the updated organizer
    return new Response(JSON.stringify({ message: "Password reset successful" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/event-organizers/reset-password:", error);
    return new Response(
      JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
      { status: 500 }
    );
  }
}
