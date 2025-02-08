const AdminUserModel = require("../models/admin.user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");

module.exports.adminAuthUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const isBlackListed = await blacklistTokenModel.findOne({ token });
        if (isBlackListed) {  
            return res.status(401).json({ message: "Unauthorized: Token is blacklisted" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await AdminUserModel.findById(decoded._id);

        if (!adminUser) {
            return res.status(401).json({ message: "Unauthorized: Admin not found" });
        }

        req.user = adminUser;  
        next();  
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
