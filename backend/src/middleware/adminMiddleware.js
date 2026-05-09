const db = require("../config/database");

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rows[0].is_admin) {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    next();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying admin" });
  }
};