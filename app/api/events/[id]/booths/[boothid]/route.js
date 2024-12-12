import formidable from "formidable";
import { promises as fs } from "fs";
import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";

// GET: Fetch a specific booth by boothId
export async function GET(request, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID
  try {
    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });
    return new Response(JSON.stringify(booth), { status: 200 });
  } catch (error) {
    console.error("Error fetching booth:", error);
    return new Response("Error fetching booth", { status: 500 });
  }
}

// PUT: Update a specific booth (supports image upload)
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID

  const form = new formidable.IncomingForm({
    multiples: false,
    uploadDir: "./uploads", // Directory to save uploaded images
    keepExtensions: true, // Preserve file extensions
  });

  try {
    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });

    return new Promise((resolve, reject) => {
      form.parse(request, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          reject(new Response("Error uploading file", { status: 500 }));
          return;
        }

        const updatedData = fields;

        if (files.image) {
          const oldPath = files.image.filepath;
          const newPath = `./uploads/${files.image.newFilename}`;
          await fs.rename(oldPath, newPath); // Move file to the final destination
          updatedData.image = `/uploads/${files.image.newFilename}`; // Store image path
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
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id, boothid } = params; // Event ID and Booth ID
  try {
    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });

    // Optionally delete the associated image
    if (deletedBooth.image) {
      const imagePath = `.${deletedBooth.image}`;
      try {
        await fs.unlink(imagePath); // Remove the image file
      } catch (err) {
        console.error("Error deleting image file:", err);
      }
    }

    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}
