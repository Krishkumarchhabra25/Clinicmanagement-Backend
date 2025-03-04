const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SupportUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [10, "username must be unique"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, "Email must be at least 3 characters long"]
    },
    password: {
        type: String,
        required: true,
        select: false
    }
});

// Instance method for generating auth token
SupportUserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Instance method for comparing passwords
SupportUserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static method for hashing passwords
SupportUserSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

// Prevent model overwriting
const SupportUserModel = mongoose.model("support", SupportUserSchema);
module.exports = SupportUserModel;
