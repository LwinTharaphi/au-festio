import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Configure formidable to save files in a specific directory
export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for file uploads
  },
};

const uploadHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'uploads'); // Adjust path as needed
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File upload error' });
    }
    // Handle the uploaded file and fields here
    const uploadedFile = files.file; // Adjust based on the file input name
    return res.status(200).json({ filePath: uploadedFile.filepath });
  });
};

export default uploadHandler;
