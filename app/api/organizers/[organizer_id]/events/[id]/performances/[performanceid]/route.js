import Performance from "@/models/Performance";
import dbConnect from "@/lib/db";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";
import Event from "@/models/Event";
import Student from "@/models/Student";

// GET: Fetch a specific performance by performanceid and event ID
export async function GET(request, { params }) {
  await dbConnect();
  const { id, performanceid } = params; // Event ID and Performance ID from URL parameters
  const performance = await Performance.findOne({ _id: performanceid, eventId: id });
  
  if (!performance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response(JSON.stringify(performance), { status: 200 });
}

// PUT: Update an existing performance
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, performanceid } = await params; // Event ID and Performance ID from URL parameters
  const data = await request.json();
  
  const updatedPerformance = await Performance.findOneAndUpdate(
    { _id: performanceid, eventId: id }, // Find performance by ID and event ID
    data,
    { new: true } // Return the updated document
  );
  
  if (!updatedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  const expo = new Expo();
  const event = await Event.findById(id);
  const student = await Student.findById({eventId: id});
  const pushTokens = student.map((student) => student.expoPushToken);

  const messages = pushTokens.map((pushToken) => ({
    to: pushToken,
    sound: "default",
    title: "Performance Update",
    body: `The performance "${updatedPerformance.name}" has been updated for the event "${event.eventName}`,
    data: {
      eventId: id,
      studentId: student._id,
      organizerId: event.organizer,
      performanceId: updatedPerformance._id,
      type: "performance_updated",
    }
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }


  return new Response(JSON.stringify(updatedPerformance), { status: 200 });
}

// DELETE: Delete a specific performance
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, performanceid } = await params; // Event ID and Performance ID from URL parameters
  
  const deletedPerformance = await Performance.findOneAndDelete({ _id: performanceid, eventId: id });
  
  if (!deletedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  return new Response("Performance deleted successfully", { status: 200 });
}
