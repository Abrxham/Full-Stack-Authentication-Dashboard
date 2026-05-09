const express = require("express");
const router = express.Router();

const {
  getTasks,
  startTask,
  completeTask
} = require("../controllers/tasksController");

const authMiddleware = require("../middleware/authMiddleware");

// rutas
router.get("/", authMiddleware, getTasks);
router.post("/start", authMiddleware, startTask);
router.post("/complete", authMiddleware, completeTask);

module.exports = router;