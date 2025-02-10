const PatientModel = require("../models/patient.model")
const mongoose = require("mongoose")
const ExcelJS = require("exceljs");


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
   
    if (updateData.dob) {
       
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

module.exports.searchPatient = async (criteria, page = 1, limit = 10) => {
  try {
    const searchCriteria = {};

    if (criteria.id) {
      if (mongoose.Types.ObjectId.isValid(criteria.id)) {
        searchCriteria._id = criteria.id;
      } else {
        throw new Error("Invalid ID format");
      }
    }

    if (criteria.patientname) {

      if (mongoose.Types.ObjectId.isValid(criteria.patientname)) {
        searchCriteria._id = criteria.patientname;
      } else {

        const words = criteria.patientname.trim().split(/\s+/);
        searchCriteria.$or = words.map(word => ({
          patientname: { $regex: word, $options: "i" }
        }));
      }
    }


    if (criteria.phonenumber) {

      if (!/^[\d+]+$/.test(criteria.phonenumber)) {
        throw new Error("Invalid phonenumber: should contain only digits or '+'");
      }
      searchCriteria.phonenumber = criteria.phonenumber;
    }


    const totalPatient = await PatientModel.countDocuments(searchCriteria);

    const patients = await PatientModel.find(searchCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      patients,
      totalPages: Math.ceil(totalPatient / limit),
      currentPage: page,
      totalPatient,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports.sortPatients = async (sortBy = "patientname", sortOrder = "asc", page = 1, limit = 10) => {
  try {
    let sortOptions = {};

    switch (sortBy) {
      case "name":  // Sort by Name (A-Z or Z-A)
        sortOptions.patientname = sortOrder === "asc" ? 1 : -1;
        break;
      case "registrationDate":  // Sort by Registration Date (Oldest → Newest or Newest → Oldest)
        sortOptions.registrationDate = sortOrder === "asc" ? 1 : -1;
        break;
      case "phonenumber":  // Sort by Phone Number (Ascending or Descending)
        sortOptions.phonenumber = sortOrder === "asc" ? 1 : -1;
        break;
      default:
        sortOptions = {}; // No sorting applied
    }

    const totalPatients = await PatientModel.countDocuments();
    const patients = await PatientModel.find()
      .sort(sortOptions)  
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      patients,
      totalPages: Math.ceil(totalPatients / limit),
      currentPage: page,
      totalPatients
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports.exportPatients = async () => {
  try {
    const patients = await PatientModel.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Patients");

    // Define columns
    worksheet.columns = [
      { header: "Patient ID", key: "_id", width: 25 },
      { header: "Name", key: "patientname", width: 20 },
      { header: "Phone Number", key: "phonenumber", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Village", key: "village", width: 15 },
      { header: "Date of Birth", key: "dob", width: 15 },
      { header: "Registration Date", key: "registrationDate", width: 20 },
    ];

    // Add rows
    patients.forEach((patient) => {
      worksheet.addRow({
        _id: patient._id,
        patientname: patient.patientname,
        phonenumber: patient.phonenumber,
        email: patient.email,
        gender: patient.gender,
        village: patient.village,
        dob: patient.dob,
        registrationDate: patient.registrationDate,
      });
    });

    // Write the file to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(error.message);
  }
};