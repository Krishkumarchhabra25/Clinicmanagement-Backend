const clinicProfileModel = require("../models/clinicAddress.model");
const {ImageUploadUtil} = require("../middlewares/multer")



  module.exports.createOrUpdateClinicProfileService = async (data, logoFile) => {
    try {
    
        let clinicProfile = await clinicProfileModel.findOne();
    
        let logoData = {};
        if (logoFile) {
          if (clinicProfile?.basicInfo?.logo?.public_id) {
            await cloudinary.uploader.destroy(clinicProfile.basicInfo.logo.public_id);
          }
    
          const b64 = logoFile.buffer.toString("base64");
          const dataUri = `data:${logoFile.mimetype};base64,${b64}`;
    
          // Upload the image using ImageUploadUtil
          const result = await ImageUploadUtil(dataUri);
    
          logoData = {
            public_id: result.public_id,
            url: result.secure_url
          };
        }
    
        if (!clinicProfile) {
          clinicProfile = new clinicProfileModel({
            basicInfo: {
              ...data.basicInfo,
              logo: logoData
            },
            address: data.address
          });
        } else {
          clinicProfile.basicInfo = {
            ...clinicProfile.basicInfo.toObject(),
            ...data.basicInfo,
            logo: logoFile ? logoData : clinicProfile.basicInfo.logo
          };
          clinicProfile.address = {
            ...clinicProfile.address.toObject(),
            ...data.address
          };
        }
    
        await clinicProfile.save();
        return clinicProfile;
      } catch (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }
  };
  
  

  
   module.exports.getClinicProfile= async () => {
      try {
        const profile = await ClinicProfile.findOne().lean();
        if (!profile) throw new Error('Clinic profile not found');
        return profile;
      } catch (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }
    }
  