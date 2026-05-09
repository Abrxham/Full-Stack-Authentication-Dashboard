const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/send-code", authController.sendPhoneCode);
router.post("/verify-code", authController.verifyPhoneCode);

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;