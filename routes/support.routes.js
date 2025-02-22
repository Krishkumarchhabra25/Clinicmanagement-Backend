const express = require("express");
const router = express.Router();
const supportController = require("../controller/support.user.controller");
const { adminAuthUser, checkRole } = require("../middlewares/auth.middleware");
const { body } = require("express-validator");

// Single support user endpoints
router.post("/create-support",
    adminAuthUser,
    checkRole(['admin']),
    [
        body("username").isLength({ min: 5 }),
        body("email").isEmail(),
        body("password").isLength({ min: 6 })
    ],
    supportController.createSupportUser
);

router.get("/get-support",
    adminAuthUser,
    checkRole(['admin']),
    supportController.getSupportUser
);

router.put("/update-support",
    adminAuthUser,
    checkRole(['admin']),
    supportController.updateSupportUser
);

router.delete("/delete-support",
    adminAuthUser,
    checkRole(['admin']),
    supportController.deleteSupportUser
);

router.get("/support/profile", supportController.getSupportProfile);

module.exports = router;