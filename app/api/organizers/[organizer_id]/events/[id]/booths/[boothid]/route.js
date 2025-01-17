// import Booth from "@/models/Booth";
// import dbConnect from "@/lib/db";

// // GET: Fetch a specific booth by boothId
// export async function GET(request, { params }) {
//   await dbConnect();
//   const { id, boothid } = params; // Event ID and Booth ID
//   try {
//     const booth = await Booth.findOne({ boothId: boothid, eventId: id });
//     if (!booth) return new Response("Booth not found", { status: 404 });
//     return new Response(JSON.stringify(booth), { status: 200 });
//   } catch (error) {
//     console.error("Error fetching booth:", error);
//     return new Response("Error fetching booth", { status: 500 });
//   }
// }

// // PUT: Update a specific booth
// export async function PUT(request, { params }) {
//   await dbConnect();
//   const { id, boothid } = params; // Event ID and Booth ID
//   const data = await request.json();
//   try {
//     const updatedBooth = await Booth.findOneAndUpdate(
//       { boothId: boothid, eventId: id },
//       data,
//       { new: true }
//     );
//     if (!updatedBooth) return new Response("Booth not found", { status: 404 });
//     return new Response(JSON.stringify(updatedBooth), { status: 200 });
//   } catch (error) {
//     console.error("Error updating booth:", error);
//     return new Response("Error updating booth", { status: 500 });
//   }
// }

// // DELETE: Delete a specific booth
// export async function DELETE(request, { params }) {
//   await dbConnect();
//   const { id, boothid } = params; // Event ID and Booth ID
//   try {
//     const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
//     if (!deletedBooth) return new Response("Booth not found", { status: 404 });
//     return new Response("Booth deleted successfully", { status: 200 });
//   } catch (error) {
//     console.error("Error deleting booth:", error);
//     return new Response("Error deleting booth", { status: 500 });
//   }
// }

import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import fs from 'fs';
import path from 'path';

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

// PUT: Update a specific booth
export async function PUT(request, { params }) {
  await dbConnect();
  const { id, boothid } = params;

  const formData = await request.formData();
  const boothNumber = formData.get('boothNumber');
  const boothName = formData.get('boothName');
  const vendorName = formData.get('vendorName');
  const image = formData.get('image');

  let imagePath = null;
  if (image) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'booths');
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, image.name);
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);
    imagePath = `/uploads/booths/${image.name}`;
  }

  try {
    const updatedBooth = await Booth.findOneAndUpdate(
      { boothId: boothid, eventId: id },
      { boothNumber, boothName, vendorName, imagePath },
      { new: true }
    );
    if (!updatedBooth) return new Response("Booth not found", { status: 404 });
    return new Response(JSON.stringify(updatedBooth), { status: 200 });
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
    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}