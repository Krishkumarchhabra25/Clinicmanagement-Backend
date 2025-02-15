const { validationResult } = require("express-validator");
const availabilityService = require("../services/Availability.service");

exports.getAvailability = async (req, res) => {
  try {
    const availabilities = await availabilityService.getAllAvailabilites();
    return res.status(200).json(availabilities);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newAvailability = await availabilityService.createAvailability(req.body);
    return res.status(201).json({ message: "Availability created successfully", newAvailability });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedAvailability = await availabilityService.updateAvailability(req.params.id, req.body);
    return res.status(200).json({ message: "Availability updated successfully", updatedAvailability });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
