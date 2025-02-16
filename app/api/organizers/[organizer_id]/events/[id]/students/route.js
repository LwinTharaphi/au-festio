// app/api/students/route.js

import Student from "@/models/Student"; // Import the Student model
import dbConnect from "@/lib/db"; // Import the database connection
import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import Event from "@/models/Event";
import Notification from "@/models/Notification";
import { sendEventsToAll } from "../../../notifications/route";
import mongoose from "mongoose";
import { Expo } from "expo-server-sdk";

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

// GET: Fetch students for a specific event
export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID from URL parameters
  try {
    const students = await Student.find({ eventId: id }); // Fetch students by event ID

    // Map through students to process the payment screenshot URL
    const studentsWithScreenshotUrl = students.map(student => {
      const paymentScreenshotUrl = `${baseS3Url}${student.paymentScreenshotUrl}`;
      const refundQRCode = `${baseS3Url}${student.refundQRCode}`;
      return {
        ...student.toObject(),
        paymentScreenshotUrl: paymentScreenshotUrl,
        refundQRCode: refundQRCode,
      };
    });

    return new Response(JSON.stringify(studentsWithScreenshotUrl), { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}


// POST a new student
export async function POST(request) {
  await dbConnect(); // Ensure the database is connected
  try {
    const data = await request.json(); // Parse the incoming JSON data from the request
    
    // let paymentScreenshotUrl = null; // Initialize the payment screenshot URL to null
    // if (data.paymentScreenshot) {
    //   const { uri, fileName } = data.paymentScreenshot; // Extract the URI and file name from the payment screenshot
    //   const paymentScreenshotUrl = await uploadFileToS3(uri, fileName); // Upload the payment screenshot to S3 
    // }
    const newStudent = new Student({ ...data, paymentScreenshotUrl: data.paymentScreenshot, refundQRCode: data.refundQRCode}); // Create a new Student instance with the provided data and the S3 URL
    // const newStudent = new Student(data);
    await newStudent.save(); // Save the new student to the database
    const event = await Event.findById(data.eventId);

    const organizerId = event.organizer;

    const expo = new Expo();
    const messages = [];
    if(event.isPaid == false) {
      if (newStudent.expoPushToken && Expo.isExpoPushToken(newStudent.expoPushToken)) {
        messages.push({
          to: newStudent.expoPushToken,
          sound: 'default',
          title: 'Event Registration',
          body: `🎉 You successfully registered for ${event.eventName}!`,
          data: {
            eventId: data.eventId,
            studentId: newStudent._id,
            organizerId: organizerId,
            type: free_event_registeration, // Dynamically changing type
          },
        });
      }
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
      }
      // Send SSE notification
      const newNotification = new Notification({
        notificationId: new mongoose.Types.ObjectId().toString(),
        eventId: data.eventId,
        organizerId: organizerId,
        title: "New Student Registration",
        body: `A new student has registered for ${event.eventName}.`,
      });

      await newNotification.save();
      console.log("Sending SSE notification for new student registration:", newNotification);
      sendEventsToAll(newNotification);
    } else {
      if (event.isPaid == true && newStudent.expoPushToken && Expo.isExpoPushToken(newStudent.expoPushToken)) {
        messages.push({
          to: newStudent.expoPushToken,
          sound: 'default',
          title: 'Event Registration',
          body: `🎉 Your information has been received for ${event.eventName}! Please wait for approval.`,
          data: {
            eventId: data.eventId,
            studentId: newStudent._id,
            organizerId: organizerId,
            type: paid_event_registeration, // Dynamically changing type
          },
        });
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
        eventId: data.eventId,
        organizerId: organizerId,
        title: "New Student Registration",
        body: `A new student has registered for ${event.eventName}. Please check the payment for registeration.`,
      });

      await newNotification.save();
      console.log("Sending SSE notification for new student registration:", newNotification);
      sendEventsToAll(newNotification);
    }
    return new Response(JSON.stringify(newStudent), { status: 201 }); // Return the newly created student
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error registering student" }),
      { status: 500 }
    ); // Return an error response if the student creation fails
  }
}
