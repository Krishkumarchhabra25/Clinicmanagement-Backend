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
exports.updateBasicInfo = async (req, res) => {
    try {
      const { clinicName, tagline } = req.body;
  
      if (!clinicName) {
        return res.status(400).json({ 
          success: false, 
          message: "Clinic name is required" 
        });
      }
  
      // Try to find existing basic info
      let basicInfo = await ClinicBasicInfo.findOne();
  
      // Handle image upload
      let logoUrl = basicInfo?.logo || null;
      if (req.file) {
        // Upload new image
        const result = await ImageUploadUtil(req.file.buffer, req.file.mimetype);
        
        // Delete old image if exists
        if (basicInfo?.logo?.public_id) {
          try {
            await cloudinary.uploader.destroy(basicInfo.logo.public_id);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }
  
        logoUrl = { 
          public_id: result.public_id, 
          url: result.secure_url 
        };
      }
  
      // Update or create new entry
      const updateData = {
        clinicName,
        tagline: tagline || basicInfo?.tagline || '',
        logo: logoUrl
      };
  
      // Upsert (update or insert) the document
      const options = { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      };
  
      const updatedInfo = await ClinicBasicInfo.findOneAndUpdate(
        {}, // Empty filter to match any document
        updateData,
        options
      );
  
      const message = basicInfo ? 
        "Clinic info updated successfully" : 
        "Clinic info created successfully";
  
      return res.status(200).json({ 
        success: true, 
        message,
        data: updatedInfo 
      });
  
    } catch (error) {
      console.error("Error processing clinic info:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to process clinic info", 
        error: error.message 
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
