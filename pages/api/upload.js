// File: /pages/api/upload.js

import { IncomingForm } from 'formidable';
import fs from 'fs';
import cloudinary from 'cloudinary';

// Non-bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Konfigurasi Cloudinary dari environment variable Vercel
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method is allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true, uploadDir: '/tmp' });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    try {
      const file = files.image;

      if (!file || !file.filepath) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const result = await cloudinary.v2.uploader.upload(file.filepath, {
        public_id: 'esp32/image1',
        folder: 'esp32',
        overwrite: true,
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Image upload failed' });
    }
  });
}
