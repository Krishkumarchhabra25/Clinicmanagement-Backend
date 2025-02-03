const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SupportUserSchema = new mongoose.Schema({
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
SupportUserSchema.generateAuthToken = function () {
    const token = jwt.sign({_id:this._id}, process.env.JWT_SECRET,{expiresIn:'24h'});
    return token;
}

SupportUserSchema.comparePassword = async function (password){
     return  await bcrypt.compare(password , this.password)
}

SupportUserSchema.hashPassword = async function (password){
    return bcrypt.hash(password , 10)
}

const SupportUserModel  = mongoose.model("user" , SupportUserSchema);

module.exports = SupportUserModel