const AdminUserModel = require("../models/admin.user.model");
const bcrypt = require("bcryptjs") 

exports.createAdminUser = async ({ username, email, password }) => {
    if (!username || !email || !password) {
        throw new Error("All fields are required");
    }

    // Check if admin already exists
    const existingAdmin = await AdminUserModel.findOne({ role: 'admin' });
    if (existingAdmin) {
        throw new Error("Admin already exists! Only one admin allowed.");
    }

    const hashedPassword = await AdminUserModel.hashPassword(password);
    
    return await AdminUserModel.create({
        username,
        email,
        password: hashedPassword,
        role: 'admin' // Explicitly set admin role
    });
};

module.exports.getAdminProfile = async (adminId) => {
    try {
        const admin = await AdminUserModel.findById(adminId)
            .select('-password') // Exclude password field
            .lean();

        if (!admin) {
            throw new Error("Admin not found");
        }

        // Ensure permissions are populated for admin role
        if (admin.role === 'admin') {
            admin.permissions = {
                patients: { view: true, create: true, edit: true, delete: true },
                appointments: { create: true, edit: true },
                availability: { edit: true }
            };
        }

        return admin;
    } catch (error) {
        throw new Error(`Failed to fetch admin profile: ${error.message}`);
    }
};

module.exports.adminLogin = async ({ identifier, password }) => {
    if (!identifier || !password) {
        throw new Error("Username/email and password are required");
    }

    try {
        const admin = await AdminUserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        }).select("+password");

        if (!admin) {
            throw new Error("Invalid credentials");
        }

        if (admin.role === 'admin') {
            admin.permissions = {
                patients: { view: true, create: true, edit: true, delete: true },
                appointments: { create: true, edit: true },
                availability: { edit: true }
            };
        }
        
        // Use the instance method instead of calling on the model
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = admin.GenerateAuthToken();

        return { success: true, token, admin };
    } catch (error) {
        throw new Error(`${error.message}`);
    }
};


module.exports.updateAdminPersonalInfo = async (adminId, personalInfoData) => {

    const admin = await AdminUserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error("Admin not found");
    }
  

    admin.personalInfo = {
      ...((admin.personalInfo && admin.personalInfo.toObject()) || {}), 
      ...personalInfoData
    };
  
    await admin.save();
    return admin;
  };


module.exports.changeAdminPassword = async ({ adminId, currentPassword, newPassword }) => {
    if (!adminId || !currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
    }

    try {
        const adminUser = await AdminUserModel.findById(adminId).select("+password");
        if (!adminUser) {
            throw new Error("Admin user not found");
        }

        // Compare provided current password with stored password
        const isMatch = await adminUser.comparePassword(currentPassword);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        // Hash new password
        const hashedPassword = await AdminUserModel.hashPassword(newPassword);

        // Update admin user's password
        adminUser.password = hashedPassword;
        await adminUser.save();

        return { success: true, message: "Password changed successfully" };
    } catch (error) {
        throw new Error(` ${error.message}`);
    }
};

module.exports.changeAdminPasswordAfterLogin = async ({ adminId, currentPassword, newPassword }) => {
    if (!adminId || !currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
    }

    try {
        // Get the admin user
        const adminUser = await AdminUserModel.findById(adminId).select("+password");
        if (!adminUser) {
            throw new Error("Admin user not found");
        }

        // Compare provided current password with stored password
        const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin user's password
        adminUser.password = hashedPassword;
        await adminUser.save();

        return { success: true, message: "Password changed successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};


module.exports.changeAdminPasswordBeforeLogin = async ({ email, lastPassword, newPassword }) => {
    if (!email || !lastPassword || !newPassword) {
        throw new Error("Email, last password, and new password are required");
    }

    try {
        // Find the admin user by email and explicitly select the password field
        const adminUser = await AdminUserModel.findOne({ email }).select("+password");

        if (!adminUser) {
            throw new Error("Admin user not found");
        }

        // Check if the password exists
        if (!adminUser.password) {
            throw new Error("Password is missing for this admin user. Please reset it.");
        }

        // Use the model's comparePassword method
        const isMatch = await adminUser.comparePassword(lastPassword);
        if (!isMatch) {
            throw new Error("Last password is incorrect");
        }

        // Use the model's hashPassword method to hash the new password
        const hashedPassword = await AdminUserModel.hashPassword(newPassword);

        // Update the user's password
        adminUser.password = hashedPassword;
        await adminUser.save();

        return { success: true, message: "Password changed successfully. You can now log in." };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports.updateSupportPermissionsService = async (permissionsData) => {
    if (!permissionsData) {
      throw new Error("Permissions data is required");
    }
  
  
    const supportUser = await AdminUserModel.findOne({ role: 'support' });
    if (!supportUser) {
      throw new Error("Support user not found");
    }
  
  
    const updatePermissions = (existingPermissions, newPermissions) => {
      Object.keys(newPermissions).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(existingPermissions, key)) {
          existingPermissions[key] = newPermissions[key]; // Update existing keys
        } else {
        }
      });
    };
  
    if (permissionsData.patients) {
      updatePermissions(supportUser.permissions.patients, permissionsData.patients);
    }
  
    if (permissionsData.appointments) {
      updatePermissions(supportUser.permissions.appointments, permissionsData.appointments);
    }
  
    if (permissionsData.availability) {
      console.log("🔄 Updating availability permissions...");
      updatePermissions(supportUser.permissions.availability, permissionsData.availability);
    }
  
  
    await supportUser.save();
  
    return supportUser;
  };
  