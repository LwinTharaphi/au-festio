import Event from "@/models/Event";
import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import { uploadFile } from "../route";
import { NextResponse } from 'next/server';
import generatePayload from "promptpay-qr";
import qrcode from 'qrcode';
import path from 'path';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Expo } from "expo-server-sdk";
import { data } from "react-router-dom";
import Staff from "@/models/Staff";

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

export async function GET(request, { params }) {
  await dbConnect();
  const { organizer_id, id } = await params;

  try {
    const event = await Event.findOne({ organizer: organizer_id, _id: id });
    if (!event) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    const posterPath = Buffer.from(event.poster, 'base64').toString('utf-8');
    const posterUrl = `${baseS3Url}${posterPath}`;
    return new Response(JSON.stringify({ ...event.toObject(), poster: posterUrl }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { organizer_id, id } = await params;

  try {
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const body = await request.json();
      if (body.refundStatus) {
        const existingEvent = await Event.findById(id);
        existingEvent.refundStatus = body.refundStatus;
        await existingEvent.save();
        console.log("Refund status updated:", existingEvent.refundStatus);
      }
    } else {
      const formData = await request.formData();
      const eventName = formData.get("eventName");
      const registerationDate = formData.get("registerationDate");
      const eventDate = formData.get("eventDate");
      const startTime = formData.get("startTime");
      const endTime = formData.get("endTime");
      const location = formData.get("location");
      const isPaid = formData.get("isPaid") === "true";
      const phone = isPaid? formData.get("phone"): null;
      const price = isPaid ? parseFloat(formData.get('price')) : null; // Parse price only if paid
      const discount = isPaid && formData.has('discount') 
        ? parseFloat(formData.get('discount')) 
        : 0;
      // const isEarlyBirdValidFlag = isPaid && formData.has('discount') && isEarlyBirdValid(registerationDate);
      // const discountPrice = isEarlyBirdValidFlag ? price - (price * discount)/100 : 0;
      // const amount = isEarlyBirdValidFlag ? discountPrice : price;
      // console.log('Amount:', amount);
      let refundPolicy = [];
      if (isPaid && formData.has("refundPolicy")) {
        try {
          refundPolicy = JSON.parse(formData.get("refundPolicy"));
          console.log("Parsed refundPolicy:", refundPolicy);
        } catch (error) {
          console.error("Failed to parse refundPolicy:", error);
          refundPolicy = [];
        }
      }
      const venueName = formData.get("venueName");
      const latitude = formData.get("latitude");
      const longitude = formData.get("longitude");

      const poster = formData.get("poster");
      const posterName = formData.get("posterName");
      const seats = formData.get('seats')? Number(formData.get('seats')): undefined;

      // const qrData = isPaid ? generatePayload(phone, { amount: amount }): null;
      // const qrSvg = isPaid
      //   ? await qrcode.toString(qrData, { type: "svg", color: { dark: "#000", light: "#fff" } })
      //   : null;
      // // Convert the SVG string into a Buffer (file-like object)
      // const qrBuffer = qrSvg ? Buffer.from(qrSvg) : null;

      // // Upload the QR code if it was generated
      // const qrPath = qrBuffer ? await uploadFile(qrBuffer, "qrcodes") : null;
      const existingEvent = await Event.findById(id);
      // Track changes
      let changes = [];
      if (eventName !== existingEvent.eventName) changes.push(`Event name changed to ${eventName}`);
      if (eventDate !== existingEvent.eventDate) changes.push(`Event date changed to ${eventDate}`);
      if (startTime !== existingEvent.startTime) changes.push(`Start time changed to ${startTime}`);
      if (endTime !== existingEvent.endTime) changes.push(`End time changed to ${endTime}`);
      if (location !== existingEvent.location) changes.push(`Location changed to ${location}`);
      if (isPaid !== existingEvent.isPaid) changes.push(`Payment status changed`);
      if (price !== existingEvent.price) changes.push(`Ticket price changed to ${price}`);
      if (discount !== existingEvent.discount) changes.push(`Discount changed to ${discount}%`);
      if (venueName !== existingEvent.venueName) changes.push(`Venue name changed to ${venueName}`);
      if (latitude !== existingEvent.latitude || longitude !== existingEvent.longitude) 
        changes.push(`Venue GPS location updated`);
      if (seats !== existingEvent.seats) changes.push(`Total seats changed to ${seats}`);
      if (poster) changes.push(`New event poster uploaded`);
      // if (phone !== existingEvent.phone) changes.push(`Contact phone number updated`);
      const updatedData = {
        eventName,
        registerationDate,
        eventDate,
        startTime,
        endTime,
        location,
        isPaid,
        price,
        discount,
        refundPolicy: Array.isArray(refundPolicy) ? refundPolicy : [],
        venueName,
        latitude,
        longitude,
        seats,
        posterName,
        // qrName: qrPath ? path.basename(qrPath) : null,
        // qr: qrPath ? qrPath : null,
        phone,
      };

      if (poster) {
        if(existingEvent.poster) {
          await deleteFile(existingEvent.poster);
        }
        updatedData.poster = await uploadFile(poster, "posters");
      }

      // Update the event with the new data
      const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });

      if (!updatedEvent) {
        return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
      }
      // Send notifications to students and staff
      if (changes.length > 0) {
        const students = await Student.find({ eventId: id });
        const expo = new Expo();
        const messages = [];

        const notificationBody = `The event "${eventName}" has been updated:\n- ${changes.join("\n- ")}`;

        students.forEach(student => {
          if (Expo.isExpoPushToken(student.expoPushToken)) {
            messages.push({
              to: student.expoPushToken,
              sound: 'default',
              title: "Event Updated",
              body: notificationBody,
              data: { eventId: id, type: "event-updated", organizerId: existingEvent.organizer },
            });
          }
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

    }

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
// const isEarlyBirdValid = (registrationTimestamp) => {
//   const now = new Date();
//   const registrationDate = new Date(registrationTimestamp);
//   const timeDifference = now - registrationDate; // in milliseconds
//   const hoursPassed = timeDifference / (1000 * 60 * 60); // convert to hours

//   return hoursPassed <= 24; // Early bird discount valid for 24 hours
// };


export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params; // Await params here

  try {
    const eventToDelete = await Event.findById(id);
    if (!eventToDelete) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }
    if(eventToDelete.poster) {
      await deleteFile(eventToDelete.poster);
    }

    const students = await Student.find({ eventId: id });
    const staffs = await Staff.find({ event: id });
    console.log("Students:", students);
    console.log("Staffs:", staffs);
    if (students.length > 0 || staffs.length > 0) {
      const expo = new Expo();
      const messages = [];
      students.forEach(student => {
        console.log("Notification sent to:", student.expoPushToken);
        if (Expo.isExpoPushToken(student.expoPushToken)) {
          messages.push({
            to: student.expoPushToken,
            sound: 'default',
            title: `${eventToDelete.eventName} Cancelled`,
            body: 'The event you registered for has been cancelled',
            data: { eventId: id, type: 'event-deleted', organizerId: eventToDelete.organizer },
          });
        }
      });
      staffs.forEach(staff => {
        console.log("Notification sent to:", staff.expoPushToken);
        if (Expo.isExpoPushToken(staff.expoPushToken)) {
          messages.push({
            to: staff.expoPushToken,
            sound: 'default',
            title: `${eventToDelete.eventName} Cancelled`,
            body: 'The event you registered as a staff has been cancelled',
            data: { eventId: id , type: 'event-deleted_staff', organizerId: eventToDelete.organizer },
          });
        }
      });
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        console.log("Sending push notification chunk:", chunk);
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }
    }
    await Student.deleteMany({ eventId: id });
    await Staff.deleteMany({ event: id });
    console.log("Delete Students and Staffs");
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return new Response(JSON.stringify({ error: "Failed to delete event" }), { status: 500 });
    }
    return new Response("Event deleted successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

const deleteFile = async (filePath) => {
  const posterPath = Buffer.from(filePath, 'base64').toString('utf-8');
  // console.log('Deleting file:', posterPath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: posterPath,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}