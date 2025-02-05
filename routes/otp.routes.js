const express = require("express");

const OtpController = require("../controller/otp.controller")

const router = express.Router();
router.post("/send-otp", OtpController.SendOtp);
router.post("/verify-otp", OtpController.verifyOTP);

module.exports = router