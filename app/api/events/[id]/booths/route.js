import Booth from "@/models/Booth";
import dbConnect from "@/lib/db";
import multer from "multer";
import path from "path";

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Save files in "public/uploads"
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
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

// Helper function to handle Multer uploads
async function parseMultipartRequest(req, res) {
  const uploadMiddleware = upload.single("image");
  await new Promise((resolve, reject) => {
    uploadMiddleware(req, res, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
  return req;
}

// GET: Fetch all booths for a specific event
export async function GET(req, { params }) {
  await dbConnect();

  try {
    const { id } = params; // Await `params` destructure for Next.js dynamic routes
    if (!id) return new Response("Event ID is required", { status: 400 });

    const booths = await Booth.find({ eventId: id });
    return new Response(JSON.stringify(booths), { status: 200 });
  } catch (error) {
    console.error("Error fetching booths:", error);
    return new Response("Error fetching booths", { status: 500 });
  }
}


// PUT: Update a specific booth, including image upload
export async function PUT(req, res) {
  await dbConnect();
  try {
    const parsedReq = await parseMultipartRequest(req, res);
    const { id, boothid } = parsedReq.params;

    // Parse form data
    const data = JSON.parse(parsedReq.body?.fields || "{}");
    if (parsedReq.file) {
      data.image = `/uploads/${parsedReq.file.filename}`;
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
    const { id, boothid } = params;
    const deletedBooth = await Booth.findOneAndDelete({ boothId: boothid, eventId: id });
    if (!deletedBooth) return new Response("Booth not found", { status: 404 });
    return new Response("Booth deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting booth:", error);
    return new Response("Error deleting booth", { status: 500 });
  }
}
