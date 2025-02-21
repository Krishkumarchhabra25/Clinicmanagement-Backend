const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use MemoryStorage to keep the file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload file buffer directly to Cloudinary
async function ImageUploadUtil(file) {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(file.buffer); // Pass buffer directly
    });

    return result.secure_url; // Return Cloudinary URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

module.exports = { upload, ImageUploadUtil };
