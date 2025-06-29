// api/upload.js - Backend API untuk ESP32-CAM
import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

export default async function handler(req, res) {
  // CORS Headers untuk ESP32-CAM
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      message: 'Gunakan POST method untuk upload gambar' 
    });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    // Cek apakah ada file yang dikirim
    if (!files.image || files.image.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Tidak ada file 'image' yang dikirim",
        message: "ESP32-CAM harus mengirim file dengan field name 'image'"
      });
    }

    const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image;

    // Upload ke Cloudinary dengan public_id tetap
    const result = await cloudinary.uploader.upload(uploadedFile.filepath, {
      public_id: 'esp32cam/image1', // Nama tetap, akan replace gambar lama
      overwrite: true,              // Replace gambar lama
      invalidate: true,             // Clear CDN cache
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { quality: 'auto' },        // Optimasi otomatis
        { fetch_format: 'auto' }    // Format terbaik untuk browser
      ]
    });

    // Hapus file temporary dari server
    if (fs.existsSync(uploadedFile.filepath)) {
      fs.unlinkSync(uploadedFile.filepath);
    }

    // Response sukses untuk ESP32-CAM dan Blynk
    return res.status(200).json({ 
      success: true,
      message: 'Upload berhasil',
      data: {
        filename: 'image1.jpg',
        url: result.secure_url,           // URL untuk Blynk Gallery
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Gagal menyimpan gambar',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}