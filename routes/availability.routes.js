const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authMiddleWare = require("../middlewares/auth.middleware")
const availabilityController = require("../controller/availability.controller");


router.get("/get-all", availabilityController.getAvailability);

router.post(
    "/create",
    [
        body("day")
            .isString()
            .isIn(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
            .withMessage("Invalid day format"),
        body("isworking")  // Use lowercase "isworking" to match schema
            .isBoolean()
            .withMessage("isworking must be a boolean"),
        body("startTime").isString().withMessage("Start time is required"),
        body("endTime").isString().withMessage("End time is required"),
    ],
    availabilityController.createAvailability,
    authMiddleWare.adminAuthUser
);

  router.put(
    "/update/:id",
    [
        body("day")
        .isString()
        .isIn(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        .withMessage("Invalid day format"),
    body("isworking")  // Use lowercase "isworking" to match schema
        .isBoolean()
        .withMessage("isworking must be a boolean"),
    body("startTime").isString().withMessage("Start time is required"),
    body("endTime").isString().withMessage("End time is required"),
    ],
    availabilityController.updateAvailability,
    authMiddleWare.adminAuthUser
  );

  module.exports = router