const ClinicBasicInfo = require('../models/clinicBasicInfo.model');
const ClinicAddress = require('../models/clinicAddress.model');
const { ImageUploadUtil } = require('../middlewares/multer');

module.exports.handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Convert buffer to Base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:${req.file.mimetype};base64,${b64}`;

    // Upload image to Cloudinary
    const result = await ImageUploadUtil(url);

    res.json({
      success: true,
      imageUrl: result.secure_url, // Cloudinary uploaded image URL
      publicId: result.public_id, // Cloudinary image ID
    });
  } catch (error) {
    console.error("❌ Image Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while uploading image",
      error: error.message, // Send error details for debugging
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

// ----------------- UNIVERSAL UPDATE/CREATE BASIC INFO -----------------
module.exports.updateBasicInfo = async (req, res) => {
  console.log("Received Data:", req.body);
  console.log("Received File:", req.file);

  try {
    const { clinicName, tagline } = req.body;

    if (!clinicName) {
      return res.status(400).json({ success: false, message: "Clinic name is required" });
    }

    // Ensure we fetch existing clinic info
    let basicInfo = await ClinicBasicInfo.findOne();
    let logoUrl = basicInfo?.logo || null;

    if (req.file) {
      try {
        const result = await ImageUploadUtil(req.file.buffer, req.file.mimetype);
        
        if (basicInfo?.logo?.public_id) {
          await cloudinary.uploader.destroy(basicInfo.logo.public_id);
        }

        logoUrl = { public_id: result.public_id, url: result.secure_url };
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
      }
    }

    const updateData = {
      clinicName,
      tagline: tagline || basicInfo?.tagline || "",
      logo: logoUrl,
    };

    if (basicInfo) {
      basicInfo = await ClinicBasicInfo.findByIdAndUpdate(basicInfo._id, updateData, { new: true });
    } else {
      basicInfo = await ClinicBasicInfo.create(updateData);
    }

    return res.status(200).json({
      success: true,
      message: "Clinic info updated successfully",
      data: basicInfo,
    });

  } catch (error) {
    console.error("Error processing clinic info:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process clinic info",
      error: error.message,
    });
  }
};



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
