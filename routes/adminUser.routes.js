const express = require("express");
const {body} = require("express-validator");
const adminUserController = require("../controller/admin.user.controller");
const authMiddleWare = require("../middlewares/auth.middleware")

const router = express.Router();

router.post("/register-admin" , [
    body("username").isLength({ min: 5 }).withMessage("Username must be at least 5 characters long"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
] ,
adminUserController.registerAdmin 
);

router.post(
    "/login-admin",
    [
        body("identifier").notEmpty().withMessage("Username or Email is required"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    adminUserController.adminLogin
);

router.post(
    "/change-password",
    authMiddleWare.adminAuthUser, 
    [
        body("currentPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
    ],
    adminUserController.changePassword
);

module.exports = router