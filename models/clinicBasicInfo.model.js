const mongoose = require('mongoose');

const ClinicBasicInfoSchema = new mongoose.Schema(
  {
    clinicName: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    logo: {
      type:String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicBasicInfo', ClinicBasicInfoSchema);
