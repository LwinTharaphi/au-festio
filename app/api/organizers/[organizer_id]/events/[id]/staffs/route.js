import Staff from "@/models/Staff"; // Import your Staff model
import dbConnect from "@/lib/db"; // Database connection utility
import { Expo } from "expo-server-sdk";
import Notification from "@/models/Notification";
import { sendEventsToAll } from "../../../notifications/route";
import mongoose from "mongoose";

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
// export async function POST(request, { params }) {
//   await dbConnect();

//   // Retrieve event ID from URL parameters
//   const { id } = await params; // Event ID from URL parameters
  
//   try {
//     // Get staff data from request body
//     const data = await request.json();

//     // Create a new staff member with the provided data and associate it with the event
//     const newStaff = new Staff({
//       ...data,
//       event: id, // Set the event ID for the staff member
//     });

//     // Save the new staff member to the database
//     await newStaff.save();

//     // Return the newly created staff member as response
//     return new Response(JSON.stringify(newStaff), { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ message: "Error creating staff" }), { status: 500 });
//   }
// }
export async function POST(request) {
  await dbConnect(); // Ensure the database is connected

  try {
    const data = await request.json(); // Parse the incoming JSON data from the request
    const newStaff = new Staff(data); // Create a new Staff instance with the provided data
    await newStaff.save(); // Save the staff member to the database

    const event = await Event.findById(data.event._id); // Fetch the event associated with the staff member

    const expo = new Expo();
    const messages = [];
    if(newStaff.expoPushToken && Expo.isExpoPushToken(newStaff.expoPushToken)) {
      messages.push({
        to: newStaff.expoPushToken,
        sound: 'default',
        title: 'Staff Registration',
        body: `🎉 Your information has been received for ${event.eventName}! Please wait for approval.`,
        data: {
          eventId: data.event._id,
          staffId: newStaff._id,
          organizerId: event.organizer,
          type: 'staff-registration',
        },
      });
      console.log("Sending push notification to staff:", messages);

      // Send the push notification
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
      }
    }

    // Send SSE notification
    const newNotification = new Notification({
      notificationId: new mongoose.Types.ObjectId().toString(),
      eventId: data.event._id,
      organizerId: event.organizer,
      title: "New Staff Registration",
      body: `A new staff member has registered for ${event.eventName}.`,
    });
    await newNotification.save();
    console.log("Sending SSE notification for new staff registration:", newNotification);
    sendEventsToAll(newNotification);

    return new Response(JSON.stringify(newStaff), { status: 201 }); // Return the newly created staff member
  } catch (error) {
    console.error("Error creating staff:", error);
    return new Response(
      JSON.stringify({ message: "Error registering staff" }),
      { status: 500 }
    ); // Return an error response if the staff creation fails
  }
}