const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AdminUserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:[10 , "username must be unique"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minlength:[5,"Email must be at least 3 characters long"]
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    role: {
        type: String,
        enum: ['admin', 'support'],
        default: 'support'
    },
    permissions: {
        patients: {
            view: { type: Boolean, default: false },
            create: { type: Boolean, default: false },
            edit: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        appointments: {
            create: { type: Boolean, default: false },
            edit: { type: Boolean, default: false }
        },
        availability: {
            edit: { type: Boolean, default: false }
        }
    },
    personalInfo:{
        fullname:{type:String , required:false},
        phoneNumber: { type: String, required: false },
        address: { type: String, required: false },
        dateOfBirth: { type: Date, required: false },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: false },
        age:{ type:String,
            required:true,}
    }
});

AdminUserSchema.pre('save', function(next) {
    if (this.role === 'admin') {
        this.permissions = {
            patients: { view: true, create: true, edit: true, delete: true },
            appointments: { create: true, edit: true },
            availability: { edit: true }
        };
    }
    next();
});

// Add pre-save hook to enforce single support user
AdminUserSchema.pre('save', async function(next) {
    if (this.role === 'support') {
        const query = { role: 'support' };
        
        // Exclude current document when updating
        if (!this.isNew) {
            query._id = { $ne: this._id };
        }

        const existingSupport = await AdminUserModel.findOne(query);
        if (existingSupport) {
            const err = new Error('Only one support user allowed in the system');
            return next(err);
        }
    }
    next();
});

AdminUserSchema.methods.GenerateAuthToken = function () {
    const token = jwt.sign({_id:this._id}, process.env.JWT_SECRET,{expiresIn:'24h'});
    return token;
}

AdminUserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

AdminUserSchema.statics.hashPassword = async function (password){
    return await  bcrypt.hash(password , 10)
}

const AdminUserModel  = mongoose.model("user" , AdminUserSchema);

module.exports = AdminUserModel