const ClinicBasicInfo = require('../models/clinicBasicInfo.model');
const ClinicAddress = require('../models/clinicAddress.model');
const { ImageUploadUtil } = require('../middlewares/multer');

module.exports.handleImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const result = await ImageUploadUtil(req.file.buffer, req.file.mimetype);

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ success: false, message: "Error uploading image", error: error.message });
    }
};

// ----------------- ADD BASIC INFO -----------------
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
};

// ----------------- UPDATE BASIC INFO -----------------
exports.updateBasicInfo = async (req, res) => {
  try {
      const { clinicName, tagline } = req.body;

      if (!clinicName) {
          return res.status(400).json({ 
              success: false, 
              message: "Clinic name is required" 
          });
      }

      let basicInfo = await ClinicBasicInfo.findOne();
      if (!basicInfo) {
          return res.status(404).json({ 
              success: false, 
              message: "Clinic basic info not found" 
          });
      }

      // Handle new image upload
      if (req.file) {
          // Upload new image
          const result = await ImageUploadUtil(
              req.file.buffer, 
              req.file.mimetype // Pass mimetype explicitly
          );
          
          // Delete old image if it exists
          if (basicInfo.logo?.public_id) {
              try {
                  await cloudinary.uploader.destroy(basicInfo.logo.public_id);
              } catch (deleteError) {
                  console.error("Error deleting old image:", deleteError);
              }
          }

          // Update logo reference
          basicInfo.logo = { 
              public_id: result.public_id, 
              url: result.secure_url 
          };
      }

      // Update other fields
      basicInfo.clinicName = clinicName;
      basicInfo.tagline = tagline || basicInfo.tagline; // Preserve existing tagline if not provided

      await basicInfo.save();

      return res.status(200).json({ 
          success: true, 
          message: "Clinic info updated successfully", 
          data: basicInfo 
      });
  } catch (error) {
      console.error("Error updating clinic basic info:", error);
      return res.status(500).json({ 
          success: false, 
          message: "Failed to update clinic info", 
          error: error.message 
      });
  }
};

// ----------------- ADD ADDRESS -----------------
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
};

// ----------------- UPDATE ADDRESS -----------------
exports.updateAddress = async (req, res) => {
    try {
        const { streetAddress1, streetAddress2, postalCode, city, state, country } = req.body;

        let address = await ClinicAddress.findOne();
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        Object.assign(address, { streetAddress1, streetAddress2, postalCode, city, state, country });
        await address.save();

        return res.status(200).json({ success: true, message: "Address updated successfully", data: address });
    } catch (error) {
        console.error("Error updating address:", error);
        return res.status(500).json({ success: false, message: "Failed to update address", error: error.message });
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
