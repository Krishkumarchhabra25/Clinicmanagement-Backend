const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer'); // Ensure correct path
const clinicController = require("../controller/clinic.user.controller");
const { checkRole, adminAuthUser } = require('../middlewares/auth.middleware');

// Image Upload Route

// Basic Info Routes
/* router.post('/add-basic-info', upload, clinicController.addBasicInfo , checkRole(['admin']) , adminAuthUser) ; */
router.put('/update-basic-info',
  upload.single('logo'),
  checkRole(['admin']),
  adminAuthUser,
  clinicController.updateBasicInfo
);
// Address Routes
/* router.post('/add-address', clinicController.addAddress , checkRole(['admin']) , adminAuthUser); */
router.put('/update-address', clinicController.updateAddress ,checkRole(['admin']) , adminAuthUser);

// Get Clinic Profile
router.get('/clinic', clinicController.getClinicProfile ,    checkRole(['admin']), adminAuthUser);
  
  



module.exports = router;