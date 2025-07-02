// file: api/upload.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dshmp0hgm',
  api_key: '272684499144954',
  api_secret: 'joqmYp5iDsmGCML2ul7KYpnMKpI',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { image } = req.body;
  const fixedPublicId = 'espcam/image'; // Hanya 1 nama

  if (!image) {
    return res.status(400).json({ error: 'Image is required (base64 or URL)' });
  }

  try {
    // 1. Hapus gambar lama
    await cloudinary.uploader.destroy(fixedPublicId, { invalidate: true });

    // 2. Upload gambar baru
    const result = await cloudinary.uploader.upload(image, {
      public_id: fixedPublicId,
      overwrite: true,
      resource_type: 'image',
    });

    res.status(200).json({
      message: 'Upload berhasil',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Upload gagal',
      error: err.message,
    });
  }
}
