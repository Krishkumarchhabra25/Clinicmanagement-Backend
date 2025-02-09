const { validationResult } = require("express-validator")
const PatientService = require("../services/Patient.service");


module.exports.addPatient = async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success:false , errors:errors.array()});;
    }
    try {
        const patient = await PatientService.addPatient(req.body);
        return res.status(201).json({success:true,data:patient});

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

module.exports.getallpatients = async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit =10;
    try {
        const patients = await PatientService.getAllPatients(page, limit);
        return res.status(200).json({ success: true, data: patients });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports.getPatientDetailsById = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const getPatientDetails = await PatientService.GetPatientDetailsById(req.params.id);
        return res.status(200).json({success:true , data:getPatientDetails})
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

module.exports.updatePatient = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const updatePatient = await PatientService.updatePatient(req.params.id, req.body);
        return res.status(200).json({success:true,data:updatePatient})
    } catch (error) {
         return res.status(400).json({success:true , message:error.message})
    }
}

module.exports.deletePatient = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const deletePatient = await PatientService.deletePatient(req.params.id);
        return res.status(200).json({ success: true, message: deletePatient });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

module.exports.searchPatients = async (req, res) => {
    try {

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      
      const { page: _page, limit: _limit, ...criteria } = req.query;
      
      const result = await PatientService.searchPatient(criteria, page, limit);
      
      return res.status(200).json({ success: true, data: result });
    } catch (error) {

      return res.status(400).json({ success: false, message: error.message });
    }
  };
  
  
  module.exports.sortPatients = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const sortBy = req.query.sortBy || "name";
      const sortOrder = req.query.sortOrder || "asc"; 
  
      const result = await PatientService.sortPatients(sortBy, sortOrder, page, limit);
  
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  };
  
  module.exports.exportPatients = async (req, res) => {
    try {
      const buffer = await PatientService.exportPatients();
  
      
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="patients.xlsx"');
      res.send(buffer);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };