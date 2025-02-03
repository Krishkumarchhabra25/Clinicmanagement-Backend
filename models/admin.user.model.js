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
    }
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