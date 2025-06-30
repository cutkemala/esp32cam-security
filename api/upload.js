// File: /api/upload.js

import { IncomingForm } from 'formidable';
import fs from 'fs';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// Non-bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Konfigurasi Cloudinary dari .env
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const form = new IncomingForm();
  form.uploadDir = '/tmp'; // Temp directory untuk menyimpan file
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Form parse error' });
    }

    try {
      const file = files.image;
      const result = await cloudinary.v2.uploader.upload(file.filepath, {
        public_id: 'esp32/image1', // timpa file lama
        folder: 'esp32',
        overwrite: true,
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (uploadErr) {
      console.error(uploadErr);
      return res.status(500).json({ message: 'Upload gagal' });
    }
  });
}
