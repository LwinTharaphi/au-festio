import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { uploadFile } from "../../route";

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const baseS3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
// GET: Fetch all booths for a specific event
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID

  try {
    const booths = await Booth.find({ eventId: id });
    const boothsWithImage = booths.map((booth) => {
      const foodImageUrl = `${baseS3Url}${booth.imagePath}`;
      // console.log('Food Image URL:', foodImageUrl);
      // console.log("Image URL:", booth.imagePath);
      return {
        ...booth.toObject(),
        imagePath: foodImageUrl,
      };
    })

    return new Response(JSON.stringify(boothsWithImage), { status: 200 });
  } catch (error) {
    console.error("Error fetching booths:", error);
    return new Response("Error fetching booths", { status: 500 });
  }
}

// POST: Create a new booth for a specific event
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params; // Event ID

  try {
    const formData = await req.formData();

    const boothNumber = formData.get("boothNumber");
    const boothName = formData.get("boothName");
    const vendorName = formData.get("vendorName");
    const image = formData.get("image");

    // Validate required fields
    if (!boothNumber || !vendorName) {
      console.error("Booth number and vendor name are required.");
      return new Response("Booth number and vendor name are required.", { status: 400 });
    }

    let imagePath = null;

    // Handle file upload if an image is provided
    if (image) {
      imagePath = await uploadFile(image, "booths");
    }

    // Create new booth
    const newBooth = new Booth({
      boothNumber,
      boothName,
      vendorName,
      imagePath,
      eventId: id,
      boothId: nanoid(10),
    });

    await newBooth.save();

    return new Response(JSON.stringify(newBooth), { status: 201 });
  } catch (error) {
    console.error("Error creating booth:", error);
    return new Response("Error creating booth", { status: 500 });
  }
}

// PUT: Update a specific booth
export async function PUT(req, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID

  try {
    const formData = await req.formData();

    const boothNumber = formData.get("boothNumber");
    const boothName = formData.get("boothName");
    const vendorName = formData.get("vendorName");
    const image = formData.get("image");

    let imagePath = null;
    const existingBooth = await Booth.findOne({ boothId: boothid, eventId: id });

    // Handle file upload if an image is provided
    if (image) {
      if(existingBooth.imagePath) {
        await deleteBoothFile(existingBooth.imagePath);
      }
      imagePath = await uploadFile(image, "booths");
    }
    console.log("Image path in put:", imagePath);

    // Update booth in the database
    const updatedBooth = await Booth.findOneAndUpdate(
      { boothId: boothid, eventId: id },
      { boothNumber, boothName, vendorName, imagePath },
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
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id, boothid } = await params; // Event ID and Booth ID

  try {
    const deleteToBooth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!deleteToBooth) {
      return new Response("Booth not found", { status: 404 });
    }
    if(deleteToBooth.imagePath) {
      await deleteBoothFile(deleteToBooth.imagePath);
    }
    const deletedBooth = await Booth.findOneAndDelete({
      boothId: boothid,
      eventId: id,
    });

    if (!deletedBooth) {
      return new Response("Booth not found", { status: 404 });
    }

    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}

export const deleteBoothFile = async (filePath) => {
  // console.log('Deleting file:', posterPath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filePath,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}