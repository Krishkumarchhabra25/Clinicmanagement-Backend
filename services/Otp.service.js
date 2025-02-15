const OtpModel = require("../models/otp.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_ADDRESS,
        pass:process.env.PASS_PASS
    },
    logger: true, 
    debug: true   
});

module.exports.SendOtp = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OtpModel.deleteMany({ email });

    const otpRecord = await OtpModel.create({ email, otp });

    try {
      const info =  await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Your OTP Code",
            html: `<p>Your OTP is: <strong>${otp}</strong>. It is valid for 2 minutes.</p>`
        });
        console.log("Email sent:", info);
        setTimeout(async () => {
            await OtpModel.deleteOne({ _id: otpRecord._id });
        }, 120 * 1000);

        return { success: true, message: "OTP sent successfully" };
    } catch (error) {
        console.error("Error sending OTP email:", error); 
        throw new Error("Failed to send OTP email");
    }
};


module.exports.verifyOtp = async (email,otp)=>{
    const otpRecord = await OtpModel.findOne({email, otp});

    if(!otpRecord) throw new Error("Invalid or expired Otp");

     return {success: true , message:"OTP is verified successfully"}
}