const supportService = require("../services/Support.service")
const AdminUserModel = require("../models/admin.user.model")
module.exports.createSupportUser = async (req, res) => {
    try {
        const { supportUser, token } = await supportService.createSupportUser(req.body);
        res.status(201).json({
            success: true,
            data: supportUser,
            token
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.getSupportUser = async (req, res) => {
    try {
        const supportUser = await supportService.getSupportUser();
        if (!supportUser) {
            return res.status(404).json({
                success: false,
                message: "Support user not found"
            });
        }
        res.json({ success: true, data: supportUser });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.updateSupportUser = async (req, res) => {
    try {
        const updatedUser = await supportService.updateSupportUser(req.body);
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.deleteSupportUser = async (req, res) => {
    try {
        await supportService.deleteSupportUser();
        res.json({
            success: true,
            message: "Support user deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports.getSupportProfile = async (req, res) => {
    try {
        // Fetch the support user
        const supportUser = await AdminUserModel.findOne({ role: 'support' })
            .select("username email password permissions role") // Include role
            .lean();

        if (!supportUser) {
            return res.status(404).json({
                success: false,
                message: "Support user not found"
            });
        }

        res.status(200).json({
            success: true,
            data: supportUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to fetch support profile: ${error.message}`
        });
    }
};
