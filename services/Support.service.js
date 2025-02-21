const AdminUserModel = require("../models/admin.user.model");


module.exports.createSupportUser = async (userData) => {
    // Check for existing support user
    const existingSupport = await AdminUserModel.findOne({ role: 'support' });
    if (existingSupport) {
        throw new Error("System already has a support user. Only one allowed.");
    }

    const hashedPassword = await AdminUserModel.hashPassword(userData.password);
    
    const newSupportUser=    await AdminUserModel.create({
        ...userData,
        role: 'support',
        password: hashedPassword,
        permissions: {
            patients: { view: false, create: false, edit: false, delete: false },
            appointments: { create: false, edit: false },
            availability: { edit: false }
        }
    });

    const token = newSupportUser.GenerateAuthToken();

    return {supportUser:newSupportUser , token}
};

// Update other service methods to handle single support user
module.exports.getSupportUser = async () => {
    return await AdminUserModel.findOne({ role: 'support' })
        .select('-password -__v');
};

exports.updateSupportUser = async (updateData) => {
    const supportUser = await AdminUserModel.findOne({ role: 'support' });
    if (!supportUser) throw new Error("Support user not found");

    if (updateData.permissions) supportUser.permissions = updateData.permissions;
    if (updateData.password) {
        supportUser.password = await AdminUserModel.hashPassword(updateData.password);
    }

    return await supportUser.save();
};

module.exports.deleteSupportUser = async () => {
    const result = await AdminUserModel.deleteOne({ role: 'support' });
    if (result.deletedCount === 0) throw new Error("Support user not found");
    return result;
};  