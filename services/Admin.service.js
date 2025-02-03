const AdminUserModel = require("../models/admin.user.model");


module.exports.createAdminUser = async({username , email, password})=>{
   if(!username || !email || !password){
      throw new Error("Username , email , password are required")
   }

   try {
      const exitingAdminUser = await AdminUserModel.findOne();
      if(exitingAdminUser){
        throw new Error("Admin already exist! . Only one Admin is allowed.")
    }
     const hashPassword = await AdminUserModel.hashPassword(password);

     const adminUser = await AdminUserModel.create({
        username,
        email,
        password:hashPassword
     });
     const token = adminUser.GenerateAuthToken();

     return { adminUser, token }; 

   } catch (error) {
     throw new Error(`Error creating admin user: ${error.message}`);
   }
}


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

        // Use the instance method instead of calling on the model
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = admin.GenerateAuthToken();

        return { success: true, token, admin };
    } catch (error) {
        throw new Error(`Error during admin login: ${error.message}`);
    }
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
        throw new Error(`Error changing password: ${error.message}`);
    }
};
