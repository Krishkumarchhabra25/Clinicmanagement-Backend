
const express = require("express");
const router = express.Router();
const { body,param } = require("express-validator");
const authMiddleWare = require("../middlewares/auth.middleware")
const PatientController = require("../controller/patient.controller");


const validatePatient = [
    body("patientname").notEmpty().withMessage("Patient name is required"),
    body("phonenumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .isMobilePhone()
      .withMessage("Invalid phone number"),
    body("email").isEmail().withMessage("Invalid email"),
    body("gender").notEmpty().withMessage("Gender is required"),
    body("village").notEmpty().withMessage("Village is required"),
    body("dob").notEmpty().withMessage("Date of birth is required"),
    body("remarks").optional()
  ];

  const updatePatinets =[
    body("patientname").optional().notEmpty().withMessage("Patient name is required"),
    body("phonenumber")
    .optional()
      .notEmpty()
      .withMessage("Phone number is required")
      .isMobilePhone()
      .withMessage("Invalid phone number"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("gender").optional().notEmpty().withMessage("Gender is required"),
    body("village").optional().notEmpty().withMessage("Village is required"),
    body("dob").optional().notEmpty().withMessage("Date of birth is required"),
    body("remarks").optional()
  ]
  
const validatePatientId = [
    param("id").isMongoId().withMessage("Invalid patient ID format"),
];
router.post("/add-patient",authMiddleWare.adminAuthUser, validatePatient, PatientController.addPatient); 
router.get("/all-patient", authMiddleWare.adminAuthUser, PatientController.getallpatients); 

router.get("/patient/:id", authMiddleWare.adminAuthUser, validatePatientId, PatientController.getPatientDetailsById);
router.put("/update-patient/:id", authMiddleWare.adminAuthUser, validatePatientId, updatePatinets, PatientController.updatePatient);
router.delete("/delete-patient/:id", authMiddleWare.adminAuthUser, validatePatientId, PatientController.deletePatient);

router.get("/search-patient", authMiddleWare.adminAuthUser, PatientController.searchPatients);

router.get("/sort-patient", authMiddleWare.adminAuthUser, PatientController.sortPatients);

router.get("/export-patient", authMiddleWare.adminAuthUser, PatientController.exportPatients);

router.get("/stats", authMiddleWare.adminAuthUser, PatientController.getDashboardStats);


module.exports = router;
