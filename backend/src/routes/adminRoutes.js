const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");

const {
  addTestBalance
} = require("../controllers/adminController");

const {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} = require("../controllers/withdrawalsController");

const authMiddleware = require("../middleware/authMiddleware");

// TEST
router.post("/add-balance", authMiddleware, adminMiddleware, addTestBalance);

// WITHDRAWALS ADMIN
router.get("/withdrawals", authMiddleware, adminMiddleware, getAllWithdrawals);
router.post("/withdrawals/approve", authMiddleware, adminMiddleware, approveWithdrawal);
router.post("/withdrawals/reject", authMiddleware, adminMiddleware, rejectWithdrawal);

module.exports = router;