const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  // Configure Multer for memory storage
  const storage = multer.memoryStorage(); // Store file in memory as buffer
  const upload = multer({ storage }).single("companyLogo"); // Expect a single image upload
  
  async function ImageUploadUtil(fileBuffer, mimeType) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "clinic_logos" },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  }
  
  

module.exports = { upload, ImageUploadUtil };