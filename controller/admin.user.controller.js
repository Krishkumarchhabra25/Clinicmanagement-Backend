const { validationResult } = require("express-validator")
const adminUserService = require("../services/Admin.service")

module.exports.registerAdmin = async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success:false , errors:errors.array()});;
    }
    const {username , email ,password}= req.body;
    
    try {
        const { adminUser, token } = await adminUserService.createAdminUser({ username, email, password });
        return res.status(201).json({ success: true, message: "Admin registered successfully", adminUser, token });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
}

module.exports.adminLogin = async (req,res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({success:false , errors:errors.array()});;
    }
    const {identifier , password} = req.body;
    try {
        const {token , admin} = await adminUserService.adminLogin({identifier ,password});
        return res.status(200).json({ success: true, message: "Login successful", token, admin });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
}

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