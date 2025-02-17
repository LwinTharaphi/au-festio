import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { uploadFile } from "../../../route";
import { deleteBoothFile } from "../route";
import Event from "@/models/Event";
import Student from "@/models/Student";
import { Expo } from "expo-server-sdk";

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
// GET: Fetch a specific booth by boothId
export async function GET(request, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID
  try {
    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });
    const boothImageUrl = `${baseS3Url}${booth.imagePath}`;
    return new Response(JSON.stringify({...booth.toOject(), imagePath: boothImageUrl}), { status: 200 });
  } catch (error) {
    console.error("Error fetching booth:", error);
    return new Response("Error fetching booth", { status: 500 });
  }
}

// PUT: Update a specific booth
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID

  try {
    const formData = await request.formData();

    // Extract fields
    const boothNumber = formData.get("boothNumber");
    const boothName = formData.get("boothName");
    const item = formData.get("item");
    const location = formData.get("location");
    const priceRange = formData.get("priceRange");
    const image = formData.get("image");

    // Validation
    if (!boothNumber || !item) {
      return new Response("Booth number and item are required.", {
        status: 400,
      });
    }

    let imagePath = null;
    const existingBooth = await Booth.findOne({ boothId: boothid, eventId: id });
    // Handle file upload if an image is provided
    if (image) {
      if (existingBooth.imagePath) {
        await deleteBoothFile(existingBooth.imagePath);
      }
      imagePath = await uploadFile(image, "booths");
    }
    console.log("Image Path booths:", imagePath);

    let changes = [];
    if (existingBooth.boothNumber !== boothNumber) {
      changes.push("boothNumber");
    }
    if (existingBooth.boothName !== boothName) {
      changes.push("boothName");
    }
    if (existingBooth.item !== item) {
      changes.push("item");
    }
    if (existingBooth.location !== location) {
      changes.push("location");
    }
    if (existingBooth.priceRange !== priceRange) {
      changes.push("priceRange");
    }
    if (existingBooth.imagePath !== imagePath) {
      changes.push("image");
    }

    // Update booth data
    const updateData = {
      boothNumber,
      boothName,
      item,
      location,
      priceRange,
    };

    if (imagePath) {
      updateData.imagePath = `${baseS3Url}${imagePath}`; // Only update imagePath if a new image is uploaded
    }

    const updatedBooth = await Booth.findOneAndUpdate(
      { boothId: boothid, eventId: id },
      updateData,
      { new: true }
    );

    if (!updatedBooth) {
      return new Response("Booth not found", { status: 404 });
    }

    // Send notification if there are changes
    if (changes.length > 0) {
    const event = await Event.findById(id);
    if (!event) return new Response("Event not found", { status: 404 });
    
    const expo = new Expo();
    const students = await Student.find({ eventId: id });
    const pushTokens = students.map((student) => student.expoPushToken);
    const validTokens = pushTokens.filter(Expo.isExpoPushToken);
    
    if (validTokens.length > 0) {
      const messageBody = `The booth "${updatedBooth.boothName}" has been updated for the event "${event.eventName}". Changes include: ${changes.join(", ")}`;
      const messages = validTokens.map((pushToken) => ({
        to: pushToken,
        sound: "default",
        title: "Booth Update",
        body: messageBody,
        data: {
          eventId: id,
          organizerId: event.organizer,
          boothId: updatedBooth._id,
          type: "booth_updated",
        },
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
  }

    return new Response(JSON.stringify(updatedBooth), { status: 200 });
  } catch (error) {
    console.error("Error updating booth:", error);
    return new Response("Error updating booth", { status: 500 });
  }
}


// DELETE: Delete a specific booth
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID
  try {
    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });
    if (booth.imagePath) {
      await deleteBoothFile(booth.imagePath);
    }
    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });

    const event = await Event.findById(id);
    if (!event) return new Response("Event not found", { status: 404 });
    const expo = new Expo();

    const students = await Student.find({ eventId: id });
    const pushTokens = students.map((student) => student.expoPushToken);
    const validTokens = pushTokens.filter(Expo.isExpoPushToken);
    if (validTokens.length === 0) {
      return new Response("No valid push tokens found", { status: 500 });
    } else {
      const messageBody = `The booth "${deletedBooth.name}" has been deleted from the event "${event.eventName}"`;
      const messages = validTokens.map((pushToken) => ({
        to: pushToken,
        sound: "default",
        title: "Performance Deleted",
        body: messageBody,
        data: {
          eventId: id,
          organizerId: event.organizer,
          boothId: deletedBooth._id,
          type: "booth_deleted",
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

    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}