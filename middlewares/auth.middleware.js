const jwt = require("jsonwebtoken")
const AdminUserModel = require("../models/admin.user.model");

module.exports.adminAuthUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await AdminUserModel.findById(decoded._id).select('+role +isActive').lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid account" });
    }

    req.user = {
      ...user,
      permissions: user.role === 'admin'
        ? {
            patients: { view: true, create: true, edit: true, delete: true },
            appointments: { create: true, edit: true },
            availability: { edit: true }
          }
        : user.permissions
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};



exports.checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
      console.log('req.user',req)
        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

exports.getAdminPermissions = () => ({
    patients: { view: true, create: true, edit: true, delete: true },
    appointments: { create: true, edit: true },
    availability: { edit: true }
});