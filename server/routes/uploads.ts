import type { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer to use memory storage (buffers)
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 10 } });


function ensureCloudinaryConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function uploadBufferToCloudinary(file: Express.Multer.File): Promise<{ url: string; public_id: string }>
{
  return new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || 'uploads';
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    uploadStream.end(file.buffer);
  });
}

export const uploadSingle = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!ensureCloudinaryConfigured()) {
        return res.status(503).json({ success: false, message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.' });
      }
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const { url, public_id } = await uploadBufferToCloudinary(req.file);
      return res.json({ success: true, url, public_id });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
    }
  }
];

export const uploadMultiple = [
  upload.array('images', 10),
  async (req: Request, res: Response) => {
    try {
      if (!ensureCloudinaryConfigured()) {
        return res.status(503).json({ success: false, message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.' });
      }
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded' });

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const uploads = await Promise.all(files.map(f => uploadBufferToCloudinary(f)));
      return res.json({ success: true, urls: uploads.map(u => u.url), assets: uploads });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
    }
  }
];
