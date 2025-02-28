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
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) throw error;
                return result;
            }
        ).end(buffer);
        return result;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
}


const upload = multer({ storage }).single('my_file');

module.exports = { upload, ImageUploadUtil };