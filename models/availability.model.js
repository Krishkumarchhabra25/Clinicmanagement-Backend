const mongoose = require("mongoose");

const AvailabilitySchme = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        required: true,
    },
    isworking:{
        type: Boolean,
        required:true,
        default:false
    },
    startTime:{
        type:String,

    },
    endTime:{
        type:String
    }
});

module.exports = mongoose.model("Availability" , AvailabilitySchme)