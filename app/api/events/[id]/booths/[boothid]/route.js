import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import multer from "multer";
import path from "path";

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle file uploads
  },
};

// GET: Fetch a specific booth by boothId
export async function GET(req, { params }) {
  await dbConnect();
  try {
    const { id, boothid } = params || {};
    if (!id || !boothid) throw new Error("Invalid parameters.");

    const booth = await Booth.findOne({ boothId: boothid, eventId: id });
    if (!booth) return new Response("Booth not found", { status: 404 });

    return new Response(JSON.stringify(booth), { status: 200 });
  } catch (error) {
    console.error("Error fetching booth:", error);
    return new Response("Error fetching booth", { status: 500 });
  }
}

// PUT: Update a specific booth, including image upload
export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id, boothid } = params || {};
    if (!id || !boothid) throw new Error("Invalid parameters.");

    const uploadMiddleware = upload.single("image");
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, {}, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const data = JSON.parse(req.body.fields || "{}");
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const updatedBooth = await Booth.findOneAndUpdate(
      { boothId: boothid, eventId: id },
      data,
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
export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id, boothid } = params || {};
    if (!id || !boothid) throw new Error("Invalid parameters.");

    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });

    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}
