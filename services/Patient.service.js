const PatientModel = require("../models/patient.model")

module.exports.addPatient = async ({ patientname, phonenumber, gender, village, email, dob, remarks }) => {
  if (!patientname || !phonenumber || !gender || !village || !email || !dob || !remarks) {
      throw new Error("All fields are required");
  }

  try {
      console.log("Checking for existing patient with email:", email);
      const existingPatient = await PatientModel.findOne({ email });

      if (existingPatient) {
          throw new Error("Patient already exists");
      }

   
      const formattedDob = new Date(dob.split("/").reverse().join("-")); 

      if (isNaN(formattedDob.getTime())) {
          throw new Error("Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY");
      }

      const newPatient = new PatientModel({
          patientname,
          email,
          phonenumber,
          village,
          gender,
          dob: formattedDob,  
          remarks
      });

      console.log("Saving new patient:", newPatient);

      return await newPatient.save();
  } catch (error) {
      console.error("Error in addPatient:", error.message);
      throw new Error(error.message);
  }
};

module.exports.getAllPatients = async(page=1 , limit=10)=>{
    try {
      const patients = await PatientModel.find()
             .skip((page-1) *limit)
             .limit(limit);

      const totalPatient = await PatientModel.countDocuments();

      return {patients , totalPages:Math.ceil(totalPatient/limit) , currentPage:page}
    } catch (error) {
      throw new Error(error.message)
    }
}

module.exports.GetPatientDetailsById= async(patientId)=>{
  try {
    const patient = await PatientModel.findById(patientId);
    if(!patientId){
      throw new Error("Patient not found")
    }

    return patient
  } catch (error) {
      throw new Error(error.message)
  }
}

module.exports.updatePatient= async(patientId, updateData)=>{
  try {
    // Check if dob exists in updateData and convert it to Date format
    if (updateData.dob) {
        // Convert "DD/MM/YYYY" to "YYYY-MM-DD" (ISO 8601 format)
        const [day, month, year] = updateData.dob.split("/");
        updateData.dob = new Date(`${year}-${month}-${day}`);

        if (isNaN(updateData.dob)) {
            throw new Error("Invalid Date Format. Use DD/MM/YYYY.");
        }
    }

    const updatePatient = await PatientModel.findByIdAndUpdate(patientId, updateData, { new: true });

    if (!updatePatient) {
        throw new Error("Patient not found");
    }

    return updatePatient;
} catch (error) {
    throw new Error(error.message);
}
}

module.exports.deletePatient = async(patientId)=>{
  try {
     const deletePatient = await PatientModel.findByIdAndDelete(patientId);
     if(!deletePatient){
        throw new Error("Patient not found")
     }
  } catch (error) {
    throw new Error(error.message);
  }
}

