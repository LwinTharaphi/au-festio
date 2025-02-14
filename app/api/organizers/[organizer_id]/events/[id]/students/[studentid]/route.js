import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import { deleteBoothFile } from "../../booths/route";
import { Expo } from "expo-server-sdk";
import Event from "@/models/Event";
import Notification from "@/models/Notification";
import { sendEventsToAll } from "../../../../notifications/route";
import mongoose from "mongoose";

const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
// GET: Fetch a specific student by student ID and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  const student = await Student.findOne({ _id: studentid, eventId: id });
  
  if (!student) {
    return new Response("Student not found", { status: 404 });
  }
  const paymentScreenshotUrl = `${baseS3Url}${student.paymentScreenshotUrl}`;
  const refundQRCode = `${baseS3Url}${student.refundQRCode}`;
  return new Response(JSON.stringify({...student.toObject(), paymentScreenshotUrl: paymentScreenshotUrl, refundQRCode: refundQRCode}), { status: 200 });
}

export async function POST(request, { params }) {
  await dbConnect(); // Connect to the database

  const { id: eventId, studentid: studentId } = params;

  try {
    // Find the student by ID
    const student = await Student.findOne({ _id: studentId, eventId: eventId });

    if (!student) {
      return new Response(
        JSON.stringify({ message: 'Student not found for this event' }),
        { status: 404 }
      );
    }

    if(student.refundStatus === 'refunded') {
      return new Response(
        JSON.stringify({ message: 'This student has been refunded and cannot use this QR.' }),
        { status: 400 }
      );
    }

    // Check if the student has already checked in
    if (student.checkInStatus === 'checked-in') {
      return new Response(
        JSON.stringify({ message: 'This student has already checked in.' }),
        { status: 400 }
      );
    }

    // Update the student's check-in status
    student.checkInStatus = 'checked-in';
    await student.save();

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Student checked-in successfully.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating check-in status:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

// PUT: Update an existing student
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  const data = await request.json();

  // Fetch existing student details
  const existingStudent = await Student.findOne({ _id: studentid, eventId: id });
  const event = await Event.findById(id);

  if (!existingStudent) {
    return new Response(JSON.stringify({ error: "Student not found" }), { status: 404 });
  }

  // Check if the status is changing
  const statusChanged = data.status && data.status !== existingStudent.status;
  const newStatus = data.status;
  const refundStatus = data.refundStatus;

  // Update the student record
  const updatedStudent = await Student.findOneAndUpdate(
    { _id: studentid, eventId: id },
    data,
    { new: true } // Return the updated document
  );

  if (!updatedStudent) {
    return new Response(JSON.stringify({ error: "Student update failed" }), { status: 500 });
  }

  // If status changed to "paid" or "rejected", send a notification
  if ((statusChanged && (newStatus === "paid" || newStatus === "rejected" )) || refundStatus === "refunded" || refundStatus === "requested") {
    const expo = new Expo();
    const messages = [];

    if (updatedStudent.expoPushToken && Expo.isExpoPushToken(updatedStudent.expoPushToken)) {
      let notificationBody, notificationDataType;
      const organizerId = event.organizer;
      if (newStatus === "paid") {
        notificationBody = `🎉 Your information has been received for ${event.eventName}! You are now confirmed for the event.`;
        notificationDataType = "registration-confirmation";
      } else if (newStatus === "rejected") {
        notificationBody = `❌ Unfortunately, your ${event.eventName} registration was rejected. Please contact the event organizer for more information.`;
        notificationDataType = "registration-rejected";
      } else if (refundStatus === "refunded") {
        notificationBody = `💸 Your refund for ${event.eventName} has been processed. Please check your account for the refund.`;
        notificationDataType = "registration-refunded";
      } else if (refundStatus === "requested") {
        notificationBody = `🔄 Your refund request for ${event.eventName} has been received. Please wait for further instructions.`;
        notificationDataType = "registration-refund-requested";
      }

      messages.push({
        to: updatedStudent.expoPushToken,
        sound: 'default',
        title: "Event Registration",
        body: notificationBody,
        data: {
          eventId: id,
          studentId: studentid,
          organizerId: organizerId,
          type: notificationDataType, // Dynamically changing type
        },
      });
      console.log("Sending push notification to student:", messages);

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

    // Send SSE notification
    const newNotification = new Notification({
      notificationId: new mongoose.Types.ObjectId().toString(),
      eventId: id,
      organizerId: event.organizer,
      title: "Refund Request",
      body: `A student has requested a refund for ${event.eventName}.`,
    });

    await newNotification.save();
    console.log("Sending SSE notification for new student registration:", newNotification);
    sendEventsToAll(newNotification);
  }

  return new Response(JSON.stringify(updatedStudent), { status: 200 });
}


// DELETE: Delete a specific student
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, studentid } = await params; // Event ID and Student ID from URL parameters
  
  const studentToDelete = await Student.findOne({ _id: studentid, eventId: id });
  if(!studentToDelete) {
    return new Response("Student not found", { status: 404 });
  }
  if(studentToDelete.paymentScreenshotUrl) {
    await deleteBoothFile(studentToDelete.paymentScreenshotUrl);
    await deleteBoothFile(studentToDelete.refundQRCode);
  }

  const deletedStudent = await Student.findOneAndDelete({ _id: studentid, eventId: id });
  
  if (!deletedStudent) {
    return new Response("Student not found", { status: 404 });
  }

  const event = await Event.findById(id);

  const expo = new Expo();
  const messages = [];
  if(deletedStudent.expoPushToken && Expo.isExpoPushToken(deletedStudent.expoPushToken)) {
    messages.push({
      to: deletedStudent.expoPushToken,
      sound: 'default',
      title: "Event Registration Cancellation",
      body: `📢 You successfully canceled your registration for ${event.eventName}.`,
      data: {
        eventId: id,
        studentId: studentid,
        type: "registration-canceled",
      },
    });
    console.log("Sending push notification to student:", messages);
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
    eventId: id,
    organizerId: event.organizer,
    title: "Student Registration Deleted",
    body: `A student has canceled their registration for ${event.eventName}.`,
  });

  await newNotification.save();
  console.log("Sending SSE notification for new student registration:", newNotification);
  sendEventsToAll(newNotification);

  return new Response("Student deleted successfully", { status: 200 });
}
