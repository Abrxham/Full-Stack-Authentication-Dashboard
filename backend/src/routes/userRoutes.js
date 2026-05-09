const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../config/database");

router.get("/profile", authMiddleware, async (req, res) => {

  const user = await pool.query(
    "SELECT id, username, email, coins, level FROM users WHERE id = $1",
    [req.user.id]
  );

  res.json(user.rows[0]);

});

module.exports = router;