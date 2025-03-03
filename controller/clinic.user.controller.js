const ClinicBasicInfo = require('../models/clinicBasicInfo.model');
const ClinicAddress = require('../models/clinicAddress.model');
const { ImageUploadUtil } = require('../middlewares/multer');

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
    const { clinicName, tagline } = req.body;
    
    // Validate required field
    if (!clinicName) {
      return res.status(400).json({ 
        success: false, 
        message: "Clinic name is required" 
      });
    }

    // Find or create clinic info
    let basicInfo = await ClinicBasicInfo.findOne() || new ClinicBasicInfo({});
    let logoData = basicInfo.logo ? { ...basicInfo.logo } : null;

    // Process new image if uploaded
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await ImageUploadUtil(
          req.file.buffer, 
          req.file.mimetype
        );

        // Delete old image if exists
        if (basicInfo.logo?.public_id) {
          await cloudinary.uploader.destroy(basicInfo.logo.public_id);
        }

        logoData = {
          public_id: result.public_id,
          url: result.secure_url
        };
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: uploadError.message
        });
      }
    }

    // Prepare update data
    const updateData = {
      clinicName,
      tagline: tagline || basicInfo.tagline || "",
      logo: logoData
    };

    // Update database
    const options = { new: true, upsert: true };
    const updatedInfo = await ClinicBasicInfo.findByIdAndUpdate(
      basicInfo._id,
      updateData,
      options
    );

    return res.status(200).json({
      success: true,
      message: "Clinic info updated",
      data: updatedInfo
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
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
