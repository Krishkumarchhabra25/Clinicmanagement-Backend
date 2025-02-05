const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
    patientname: {
        type: String,
        required: true,
        trim: true
    },
    phonenumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, "Invalid phone number"] 
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"] 
    },
    village: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, "Invalid email format"] 
    },
    dob: {
        type: Date, // Store as Date instead of String
        required: true,
        get: (dob) => dob.toLocaleDateString("en-GB") 
    },
    remarks: {
        type: String,
        default: "" 
    }
}, { timestamps: true });

module.exports = mongoose.model("Patient", PatientSchema);
