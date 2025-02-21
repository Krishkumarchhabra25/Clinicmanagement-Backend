const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {upload} = require('../middlewares/multer');
const clinicController = require("../controller/clinic.user.controller")

const { checkRole } = require('../middlewares/auth.middleware');



// Routes
// Endpoints for Basic Info
router.post('/add-basic-info',  clinicController.createOrUpdateBasicInfo,  upload.single('logo'), );
router.put('/update-basic-info', clinicController.createOrUpdateBasicInfo , upload.single("logo") );

// Endpoints for Address
router.post('/clinic/address',  clinicController.createOrUpdateAddress,  upload.single('logo'));
router.put('/clinic/address', clinicController.createOrUpdateAddress ,upload.single('logo') );

// Combined GET endpoint for the full clinic profile
router.get('/clinic', clinicController.getClinicProfile);

  
  



module.exports = router;