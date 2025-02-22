const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const clinicController = require("../controller/clinic.user.controller");

// Image Upload Route
router.post('/upload-image', upload, clinicController.handleImageUpload);

// Basic Info Routes
router.post('/add-basic-info', upload, clinicController.addBasicInfo);
router.put('/update-basic-info', upload, clinicController.updateBasicInfo);

// Address Routes
router.post('/add-address', clinicController.addAddress);
router.put('/update-address', clinicController.updateAddress);

// Get Clinic Profile
router.get('/clinic', clinicController.getClinicProfile);
  
  



module.exports = router;