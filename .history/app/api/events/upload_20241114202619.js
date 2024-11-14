import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), '/public/uploads');

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm({ uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error uploading file' });
      }

      const filePath = `/uploads/${files.file.newFilename}`;
      res.status(200).json({ filePath });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
