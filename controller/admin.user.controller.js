const { validationResult } = require("express-validator")
const adminUserService = require("../services/Admin.service")


module.exports.registerAdmin = async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;
        const admin = await adminUserService.createAdminUser({ username, email, password });
        
        // Manually set permissions for response
        const responseAdmin = admin.toObject();
        responseAdmin.permissions = {
            patients: { view: true, create: true, edit: true, delete: true },
            appointments: { create: true, edit: true },
            availability: { edit: true }
        };

        res.status(201).json({
            success: true,
            data: responseAdmin
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


  
module.exports.getAdminProfile = async (req, res) => {
    try {
        const adminProfile = await adminUserService.getAdminProfile(req.user._id);
        
        res.status(200).json({
            success: true,
            data: adminProfile
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.adminLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
  
    const { identifier, password } = req.body;
    try {
      const { token, admin } = await adminUserService.adminLogin({
        identifier,
        password,
      });
  
      res.cookie("token", token, {
        httpOnly: true, // Prevents client-side access
        secure: process.env.NODE_ENV === "production", // Secure flag for production
        sameSite: "lax", // Lax mode to allow credentials across origins
        maxAge: 24 * 60 * 60 * 1000, // 1-day expiration
      });
  
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        admin,
      });
    } catch (error) {
      return res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  };

  module.exports.updateAdminPersonalInfo = async (req, res) => {
    try {
   
      const personalInfoData = req.body;
  
      const updatedAdmin = await adminUserService.updateAdminPersonalInfo(req.user._id, personalInfoData);
  
      res.status(200).json({
        success: true,
        message: "Personal info updated successfully",
        data: updatedAdmin.personalInfo,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports.changePassword = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
    }

    try {
        const result = await adminUserService.changeAdminPassword({
            adminId: req.user._id,
            currentPassword,
            newPassword
        });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.changePasswordAfterLogin = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new passwords are required" });
  }

  try {
      const result = await adminUserService.changeAdminPasswordAfterLogin({
          adminId: req.user._id,
          currentPassword,
          newPassword,
      });

      return res.status(200).json(result);
  } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
  }
};
module.exports.changeSupportPasswordAfterLogin = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required" });
  }

  try {
      const result = await adminUserService.changeSupportPasswordAftrLogin({
          email,
          newPassword,
      });

      return res.status(200).json(result);
  } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.changePasswordBeforeLogin = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, lastPassword, newPassword } = req.body;
  if (!email || !lastPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, last password, and new password are required" });
  }

  try {
      const result = await adminUserService.changeAdminPasswordBeforeLogin({
          email,
          lastPassword,
          newPassword,
      });

      return res.status(200).json(result);
  } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
  }
};


module.exports.updateSupportPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json({ success: false, message: "Permissions object is required" });
    }


    const updatedSupportUser = await adminUserService.updateSupportPermissionsService(permissions);


    res.status(200).json({
      success: true,
      message: "Support permissions updated successfully",
      data: updatedSupportUser.permissions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};