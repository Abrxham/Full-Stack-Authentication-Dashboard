const express = require("express");
const router = express.Router();
const { startTask } = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/start", authMiddleware, startTask);

module.exports = router;