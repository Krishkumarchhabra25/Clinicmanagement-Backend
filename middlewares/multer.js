const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

async function ImageUploadUtil(buffer, mimetype) {
    try {
        const base64String = buffer.toString('base64');
        const dataUri = `data:${mimetype};base64,${base64String}`;
        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'auto'
        });
        return result;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
}

const upload = multer({ storage }).single('my_file');

module.exports = { upload, ImageUploadUtil };