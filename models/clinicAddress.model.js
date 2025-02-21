

const mongoose = require('mongoose');

const ClinicAddressSchema = new mongoose.Schema(
  {
    streetAddress1: {
      type: String,
      required: [true, 'Street Address 1 is required'],
    },
    streetAddress2: {
      type: String,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal/Zip code is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'United States',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicAddress', ClinicAddressSchema);

