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

  const existingPerformance = await Performance.findOne({ _id: performanceid, eventId: id });
  if (!existingPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  const changedFields = [];
  let nameUpdatedMessage = null;
  if (data.name && data.name !== existingPerformance.name) {
    changedFields.push("name");
    nameUpdatedMessage = `The ${existingPerformance.name} performance name has been updated to "${data.name}"`;
  } else if (data.description && data.description !== existingPerformance.description) {
    changedFields.push("description");
  } else if (data.startTime && data.startTime !== existingPerformance.startTime) {
    changedFields.push("startTime");
  } else if (data.endTime && data.endTime !== existingPerformance.endTime) {
    changedFields.push("endTime");
  }
  
  const updatedPerformance = await Performance.findOneAndUpdate(
    { _id: performanceid, eventId: id }, // Find performance by ID and event ID
    data,
    { new: true } // Return the updated document
  );
  
  if (!updatedPerformance) {
    return new Response("Performance not found", { status: 404 });
  }

  if (changedFields.length === 0) {
    return new Response(JSON.stringify(updatedPerformance), { status: 200 });
  }

  const event = await Event.findById(id);
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }
  const student = await Student.find({eventId: id});
  const pushTokens = student.map((student) => student.expoPushToken);

  if(pushTokens.length >0 ){
    const expo = new Expo();
    const validTokens = pushTokens.filter(Expo.isExpoPushToken);

    if (validTokens.length === 0) {
      return new Response("No valid push tokens found", { status: 500 });
    }
    let messageBody;
    if(nameUpdatedMessage){
      messageBody = nameUpdatedMessage;
    } else {
      messageBody = `The performance "${existingPerformance.name}" has been updated for the event "${event.eventName}: ${changedFields.join(", ")}"`;
    }
    const messages = validTokens.map((pushToken) => ({
      to: pushToken,
      sound: "default",
      title: "Performance Update",
      body: messageBody,
      data: {
        eventId: id,
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
