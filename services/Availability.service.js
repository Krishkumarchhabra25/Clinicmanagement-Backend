const AvailabilityModel = require("../models/availability.model");

const isTimeOverlapping = (existingEntries , newStartTime , newEndTime)=>{
    return existingEntries.some(({startTime , endTime})=>{
         return (
            (newStartTime >= startTime && newStartTime < endTime) ||  //new start time overlaps existing
            (newEndTime > startTime && newEndTime <= endTime) || //new end time overlaps existing
            (newStartTime <= startTime && newEndTime >= endTime)  // new range completer covers existing
         )
    })
}

module.exports.getAllAvailabilites  = async()=>{
    try {
        return await AvailabilityModel.find();
    } catch (error) {
         throw new Error(error.message)
    }
}

module.exports.createAvailability = async (data) => {
    const { day, isworking, startTime, endTime } = data;

    // Ensure `isworking` is a boolean
    const isWorkingBoolean = (typeof isworking === "string") ? isworking === "true" : !!isworking;

    const existingEntries = await AvailabilityModel.find({ day });

    if (isTimeOverlapping(existingEntries, startTime, endTime)) {
        throw new Error("Time range conflicts with an existing availability on this day");
    }

    const newAvailability = new AvailabilityModel({
        day,
        isworking: isWorkingBoolean,  // ✅ Ensure boolean value
        startTime,
        endTime
    });

    return await newAvailability.save();
};


module.exports.updateAvailability = async(id, data)=>{
    const { day, isworking, startTime, endTime } = data;

    
    
    const existingAvailability = await AvailabilityModel.findById(id);
    if(!existingAvailability){
        throw new Error("Availability not found")
    }

    const otherEntries = await AvailabilityModel.find({day,_id:{$ne:id}});

    if(isTimeOverlapping(otherEntries , startTime , endTime)){
        throw new Error("Updated time range conflicts with an existing availability on this day.")
    }
    existingAvailability.isworking = isworking;
    existingAvailability.startTime = startTime;
    existingAvailability.endTime = endTime;

    return await existingAvailability.save();

}