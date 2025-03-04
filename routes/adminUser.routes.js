const express = require("express");
const { body } = require("express-validator"); // ✅ Use body instead of check
const adminUserController = require("../controller/admin.user.controller");
const authMiddleWare = require("../middlewares/auth.middleware");

const router = express.Router();

// Register Admin
router.post(
  "/register-admin",
  [
    body("username").isLength({ min: 5 }).withMessage("Username must be at least 5 characters long"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  adminUserController.registerAdmin
);

// Admin Login
router.post(
  "/login-admin",
  [
    body("identifier").notEmpty().withMessage("Username or Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  adminUserController.adminLogin
);

// Change Password After Login (Authenticated)
router.post(
  "/change-password",
  authMiddleWare.adminAuthUser,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  ],
  adminUserController.changePassword
);

// Change Password Before Login (Forgot Password)
router.post(
  "/change-password-before-login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  ],
  adminUserController.changePasswordBeforeLogin
);

// Change Password After Login (Authenticated)
router.post(
  "/change-password-after-login",
  authMiddleWare.adminAuthUser,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  ],
  adminUserController.changePasswordAfterLogin
);

router.post(
  "/change-support-password",
  authMiddleWare.adminAuthUser,
  [
      body("email").isEmail().withMessage("Valid email is required"),
      body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  ],
  adminUserController.changeSupportPasswordAfterLogin
);

// Update Personal Info
router.put(
  "/personal-info",
  authMiddleWare.adminAuthUser,
  [
    body("fullname").optional().isString().withMessage("Full name must be a string"),
    body("phoneNumber").optional().isString().withMessage("Phone number must be a string"),
    body("address").optional().isString().withMessage("Address must be a string"),
    body("dateOfBirth").optional().isISO8601().toDate().withMessage("Invalid date"),
    body("gender").optional().isIn(["Male", "Female", "Other"]).withMessage("Invalid gender"),
  ],
  adminUserController.updateAdminPersonalInfo
);

// Get Admin Profile
router.get(
  "/admin-profile",
  authMiddleWare.adminAuthUser,
  adminUserController.getAdminProfile
);

// Update Support Permissions
router.put(
  "/update-support-permissions",
  authMiddleWare.adminAuthUser,
  [body("permissions").exists().withMessage("Permissions object is required")],
  adminUserController.updateSupportPermissions
);

module.exports = router;
  