const OtpService = require("../services/Otp.service");

module.exports.SendOtp = async(req,res)=>{
    const {email}= req.body;
    try {
        const response = await OtpService.SendOtp(email);
        res.status(200).json(response);

    } catch (error) {
         res.status(400).json({ success: false, message: error.message });
    }
}

module.exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const response = await OtpService.verifyOtp(email, otp);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
