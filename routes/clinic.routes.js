const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const clinicController = require("../controller/clinic.user.controller");
const { checkRole, adminAuthUser } = require('../middlewares/auth.middleware');

// Image Upload Route
router.post('/upload-image', upload, clinicController.handleImageUpload , checkRole(['admin']) ,adminAuthUser );

// Basic Info Routes
router.post('/add-basic-info', upload, clinicController.addBasicInfo , checkRole(['admin']) , adminAuthUser) ;
router.put('/update-basic-info', upload, clinicController.updateBasicInfo , checkRole(['admin']) , adminAuthUser);

// Address Routes
router.post('/add-address', clinicController.addAddress , checkRole(['admin']) , adminAuthUser);
router.put('/update-address', clinicController.updateAddress ,checkRole(['admin']) , adminAuthUser);

// Get Clinic Profile
router.get('/clinic', clinicController.getClinicProfile ,    checkRole(['admin']), adminAuthUser);
  
  



module.exports = router;