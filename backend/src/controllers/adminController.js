const db = require("../config/database");

exports.addTestBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    await db.query(
      "UPDATE users SET coins = coins + $1 WHERE id = $2",
      [amount, userId]
    );

    res.json({
      message: "Balance added",
      amount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding balance" });
  }
};