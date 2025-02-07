//api for update and delete for each staff

import Staff from "@/models/Staff"; // Import your Staff model
import dbConnect from "@/lib/db";  // Database connection utility
import { Expo } from "expo-server-sdk";
import Event from "@/models/Event";

// GET: Fetch a specific staff by staffid and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, staffid } = params; // Event ID and Staff ID from URL parameters
  const staff = await Staff.findOne({ _id: staffid, eventId: id });

  if (!staff) {
    return new Response("Staff not found", { status: 404 });
  }

  return new Response(JSON.stringify(staff), { status: 200 });
}


// PUT: Update an existing staff member's details
export async function PUT(request, { params }) {
  await dbConnect();
  
  const { id, staffid } = await params; // Event ID and Staff ID from URL parameters
  const data = await request.json(); // Get the updated data from request body
  
  try {
    // Fetch existing student details
    const existingStaff = await Staff.findOne({ _id: staffid, event: id });
    const event = await Event.findById(id);

    if (!existingStaff) {
      return new Response(JSON.stringify({ error: "Staff not found" }), { status: 404 });
    }

    // Check if the status is changing
    const statusChanged = data.status && data.status !== existingStaff.status;
    const newStatus = data.status;
    // Update the staff member's information by event ID and staff ID
    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: staffid, event: id }, // Find staff by ID and event ID
      data, // The updated staff data
      { new: true } // Return the updated document
    );
    
    if (!updatedStaff) {
      return new Response("Staff not found", { status: 404 });
    }

    // If status changed to "paid" or "rejected", send a notification
    if (statusChanged && (newStatus === "approved" || newStatus === "rejected")) {
      const expo = new Expo();
      const messages = [];

      if (updatedStaff.expoPushToken && Expo.isExpoPushToken(updatedStaff.expoPushToken)) {
        let notificationBody, notificationDataType;
        const organizerId = event.organizer;
        if (newStatus === "approved") {
          notificationBody = `🎉 Your information has been received for ${event.eventName}! You are now confirmed for the event.`;
          notificationDataType = "staff-confirmation";
        } else if (newStatus === "rejected") {
          notificationBody = `❌ Unfortunately, your ${event.eventName} registration was rejected. Please contact the event organizer for more information.`;
          notificationDataType = "staff-rejected";
        }

        messages.push({
          to: updatedStaff.expoPushToken,
          sound: 'default',
          title: "Staff Registration",
          body: notificationBody,
          data: {
            eventId: id,
            staffId: staffid,
            organizerId: organizerId,
            type: notificationDataType, // Dynamically changing type
          },
        });
        console.log("Sending push notification to staff:", messages);

        // Send notification in chunks
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk);
          } catch (error) {
            console.error("Error sending push notification:", error);
          }
        }
      }
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
