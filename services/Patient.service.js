const PatientModel = require("../models/patient.model")

module.exports.AddPatient = async({patientname,phonenumber,gender,village,email,dob,remarks})=>{
  if(!patientname || !phonenumber || !gender || !village || !email || !dob || !remarks){
      throw new Error("All are required")
  }

  try {
    const existingPatient = PatientModel.findOne();
    if(existingPatient){
        throw new Error("Patient already exist")
    }
  } catch (error) {
    
  }
}