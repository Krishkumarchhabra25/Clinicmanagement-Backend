const ClinicBasicInfo = require('../models/clinicBasicInfo.model');
const ClinicAddress = require('../models/clinicAddress.model');
const { ImageUploadUtil } = require('../middlewares/multer');
const { uploadImage, deleteImage } = require('../utils/ImageUtils');

module.exports.handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Directly use the file buffer from multer
    const result = await ImageUploadUtil(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while uploading image",
      error: error.message,
    });
  }
};



// ----------------- UNIVERSAL UPDATE/CREATE BASIC INFO -----------------
module.exports.updateBasicInfo = async (req, res) => {
  try {
  

    // Trim the clinicName to remove accidental whitespace
    const clinicName = req.body.clinicName ? req.body.clinicName.trim() : "";
    const { tagline } = req.body;

    
    let clinicInfo = await ClinicBasicInfo.findOne() || new ClinicBasicInfo({});
    const oldPublicId = clinicInfo.logo?.public_id;

    if (req.file) {
      const { buffer, mimetype } = req.file;
      const newImage = await uploadImage(buffer, mimetype);
      
      if (oldPublicId) {
        await deleteImage(oldPublicId);
      }

      clinicInfo.logo = newImage;
    }

    clinicInfo.clinicName = clinicName;
    clinicInfo.tagline = tagline || clinicInfo.tagline;

    const savedInfo = await clinicInfo.save();

    return res.json({
      success: true,
      message: "Clinic info updated successfully",
      data: savedInfo
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};


/* // ----------------- ADD BASIC INFO -----------------
exports.addBasicInfo = async (req, res) => {
    try {
        const { clinicName, tagline } = req.body;

        if (!clinicName) {
            return res.status(400).json({ success: false, message: "Clinic name is required" });
        }

        let logoUrl = null;
        if (req.file) {
          const result = await ImageUploadUtil(req.file.buffer, req.file.mimetype);
          logoUrl = { public_id: result.public_id, url: result.secure_url };
      }

        const basicInfo = new ClinicBasicInfo({ clinicName, tagline, logo: logoUrl });
        await basicInfo.save();

        return res.status(201).json({ success: true, message: "Clinic info added successfully", data: basicInfo });
    } catch (error) {
        console.error("Error adding clinic basic info:", error);
        return res.status(500).json({ success: false, message: "Failed to add clinic info", error: error.message });
    }
}; */

/* // ----------------- ADD ADDRESS -----------------
exports.addAddress = async (req, res) => {
    try {
        const { streetAddress1, streetAddress2, postalCode, city, state, country } = req.body;

        if (!streetAddress1 || !postalCode || !city || !state || !country) {
            return res.status(400).json({ success: false, message: "Missing required address fields" });
        }

        const address = new ClinicAddress({ streetAddress1, streetAddress2, postalCode, city, state, country });
        await address.save();

        return res.status(201).json({ success: true, message: "Address added successfully", data: address });
    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ success: false, message: "Failed to add address", error: error.message });
    }
}; */

// ----------------- UPDATE ADDRESS -----------------
exports.updateAddress = async (req, res) => {
    try {
        const { streetAddress1, streetAddress2, postalCode, city, state, country } = req.body;

        // Try to find existing address
        let address = await ClinicAddress.findOne();

        if (!address) {
            // If no address exists, create a new one
            address = new ClinicAddress({
                streetAddress1,
                streetAddress2,
                postalCode,
                city,
                state,
                country
            });
        } else {
            // Update existing address
            Object.assign(address, { 
                streetAddress1,
                streetAddress2,
                postalCode,
                city,
                state,
                country
            });
        }

        await address.save();

        return res.status(200).json({ 
            success: true, 
            message: address.isNew ? "Address created successfully" : "Address updated successfully",
            data: address
        });
    } catch (error) {
        console.error("Error updating address:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to update address", 
            error: error.message 
        });
    }
};

// ----------------- GET CLINIC PROFILE -----------------
exports.getClinicProfile = async (req, res) => {
    try {
        const basicInfo = await ClinicBasicInfo.findOne().lean();
        const address = await ClinicAddress.findOne().lean();

        if (!basicInfo && !address) {
            return res.status(404).json({ success: false, message: "Clinic profile not found" });
        }

        return res.status(200).json({ success: true, data: { basicInfo, address } });
    } catch (error) {
        console.error("Error fetching clinic profile:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
    }
};
