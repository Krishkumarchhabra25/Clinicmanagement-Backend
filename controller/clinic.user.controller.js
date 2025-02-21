const { validationResult } = require('express-validator');

const ClinicBasicInfo = require('../models/clinicBasicInfo.model');
const ClinicAddress = require("../models/clinicAddress.model")
exports.createOrUpdateBasicInfo = async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
  
    try {
      const { clinicName, tagline } = req.body;
      if (!clinicName) {
        return res.status(400).json({ success: false, message: "Clinic name is required" });
      }
  
      let logoUrl = null;
      if (req.file) {
        logoUrl = await ImageUploadUtil(req.file); // Upload to Cloudinary
      }
  
      let basicInfo = await ClinicBasicInfo.findOne();
      if (!basicInfo) {
        basicInfo = new ClinicBasicInfo({ clinicName, tagline, logo: logoUrl });
      } else {
        basicInfo.clinicName = clinicName;
        basicInfo.tagline = tagline;
        if (logoUrl) basicInfo.logo = logoUrl; // Update logo only if new file is provided
      }
      await basicInfo.save();
  
      return res.status(200).json({ success: true, data: basicInfo });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  

exports.createOrUpdateAddress = async (req, res) => {
    try {
      const { streetAddress1, streetAddress2, postalCode, city, state, country } = req.body;
      let address = await ClinicAddress.findOne(); // Assuming only one record exists
      if (!address) {
        address = new ClinicAddress({ streetAddress1, streetAddress2, postalCode, city, state, country });
      } else {
        address.streetAddress1 = streetAddress1;
        address.streetAddress2 = streetAddress2;
        address.postalCode = postalCode;
        address.city = city;
        address.state = state;
        address.country = country;
      }
      await address.save();
      return res.status(200).json({ success: true, data: address });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  exports.getClinicProfile = async (req, res) => {
    try {
      const basicInfo = await ClinicBasicInfo.findOne().lean();
      const address = await ClinicAddress.findOne().lean();
      if (!basicInfo && !address) {
        return res.status(404).json({ success: false, message: 'Clinic profile not found' });
      }
      return res.status(200).json({ success: true, data: { basicInfo, address } });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
}