import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import fs from 'fs';
import path from 'path';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { uploadFile } from "../../../route";
import { deleteBoothFile } from "../route";

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
    const vendorName = formData.get("vendorName");
    const image = formData.get("image");

    // Validation
    if (!boothNumber || !vendorName) {
      return new Response("Booth number and vendor name are required.", {
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

    // Update booth data
    const updateData = {
      boothNumber,
      boothName,
      vendorName,
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
    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}