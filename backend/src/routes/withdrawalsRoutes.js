const express = require("express");
const router = express.Router();

const { requestWithdrawal } = require("../controllers/withdrawalsController");
const authMiddleware = require("../middleware/authMiddleware");

// rutas
router.post("/request", authMiddleware, requestWithdrawal);

module.exports = router;