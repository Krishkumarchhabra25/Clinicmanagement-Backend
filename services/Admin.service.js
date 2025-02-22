const AdminUserModel = require("../models/admin.user.model");


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


module.exports.updateSupportPermissionsService = async (permissionsData) => {
    if (!permissionsData) {
      console.error("❌ Error: Permissions data is required");
      throw new Error("Permissions data is required");
    }
  
    console.log("🔍 Received permissions update request:", JSON.stringify(permissionsData, null, 2));
  
    // Find the support user
    const supportUser = await AdminUserModel.findOne({ role: 'support' });
    if (!supportUser) {
      console.error("❌ Error: Support user not found");
      throw new Error("Support user not found");
    }
  
    console.log("✅ Found support user:", supportUser.email);
  
    // Function to safely update permissions while keeping the correct structure
    const updatePermissions = (existingPermissions, newPermissions) => {
      Object.keys(newPermissions).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(existingPermissions, key)) {
          existingPermissions[key] = newPermissions[key]; // Update existing keys
        } else {
          console.warn(`⚠️ Skipping unknown permission key: ${key}`);
        }
      });
    };
  
    // Update patients permissions if provided
    if (permissionsData.patients) {
      console.log("🔄 Updating patients permissions...");
      updatePermissions(supportUser.permissions.patients, permissionsData.patients);
    }
  
    // Update appointments permissions if provided
    if (permissionsData.appointments) {
      console.log("🔄 Updating appointments permissions...");
      updatePermissions(supportUser.permissions.appointments, permissionsData.appointments);
    }
  
    // Update availability permissions if provided
    if (permissionsData.availability) {
      console.log("🔄 Updating availability permissions...");
      updatePermissions(supportUser.permissions.availability, permissionsData.availability);
    }
  
    // Log final permissions before saving
    console.log("✅ Updated permissions before saving:", JSON.stringify(supportUser.permissions, null, 2));
  
    await supportUser.save();
    console.log("✅ Support user permissions saved successfully!");
  
    return supportUser;
  };
  