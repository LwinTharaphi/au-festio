import formidable from "formidable";
import { promises as fs } from "fs";
import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import { nanoid } from "nanoid"; // Import nanoid for unique boothId

// GET: Fetch all booths for a specific event
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params; // Event ID
  try {
    const booths = await Booth.find({ eventId: id });
    return new Response(JSON.stringify(booths), { status: 200 });
  } catch (error) {
    console.error("Error fetching booths:", error);
    return new Response("Error fetching booths", { status: 500 });
  }
}

// POST: Create a new booth for a specific event with image upload
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = params; // Event ID

  // Initialize formidable for handling file uploads
  const form = new formidable.IncomingForm({
    multiples: false, // Single file upload
    uploadDir: "./uploads", // Directory to save uploaded files
    keepExtensions: true, // Keep file extensions
  });

  try {
    return new Promise((resolve, reject) => {
      // Parse the incoming request
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          reject(new Response("Error uploading file", { status: 500 }));
          return;
        }

        // Prepare the booth data
        const newBoothData = {
          ...fields,
          eventId: id,
          boothId: nanoid(10), // Generate a unique boothId
          image: files.image ? `/uploads/${files.image.newFilename}` : undefined, // Save image path
        };

        if (files.image) {
          const oldPath = files.image.filepath; // Temporary path
          const newPath = `./uploads/${files.image.newFilename}`; // Final path
          await fs.rename(oldPath, newPath); // Move file to the final destination
        }

        // Save the booth to the database
        const newBooth = new Booth(newBoothData);
        await newBooth.save();
        resolve(new Response(JSON.stringify(newBooth), { status: 201 }));
      });
    });
  } catch (error) {
    console.error("Error creating booth:", error);
    return new Response("Error creating booth", { status: 500 });
  }
}

// PUT: Update a specific booth
export async function PUT(req, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID

  const form = new formidable.IncomingForm({
    multiples: false,
    uploadDir: "./uploads",
    keepExtensions: true,
  });

  try {
    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          reject(new Response("Error uploading file", { status: 500 }));
          return;
        }

        const updatedData = fields;
        if (files.image) {
          const oldPath = files.image.filepath;
          const newPath = `./uploads/${files.image.newFilename}`;
          await fs.rename(oldPath, newPath);
          updatedData.image = `/uploads/${files.image.newFilename}`;
        }

        const updatedBooth = await Booth.findOneAndUpdate(
          { boothId: boothid, eventId: id },
          updatedData,
          { new: true }
        );

        resolve(new Response(JSON.stringify(updatedBooth), { status: 200 }));
      });
    });
  } catch (error) {
    console.error("Error updating booth:", error);
    return new Response("Error updating booth", { status: 500 });
  }
}

// DELETE: Delete a specific booth
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID
  try {
    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });
    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}
