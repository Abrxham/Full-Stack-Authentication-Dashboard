const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

exports.requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, wallet } = req.body;

    const MIN_WITHDRAW = 5;

    // 1. Validaciones básicas
    if (amount < MIN_WITHDRAW) {
      return res.status(400).json({
        message: "Minimum withdrawal is 5 USDT"
      });
    }

    if (!wallet.startsWith("T")) {
      return res.status(400).json({
        message: "Invalid TRC20 wallet"
      });
    }

    // 2. Verificar retiro pendiente
    const pending = await db.query(
      "SELECT * FROM withdrawals WHERE user_id = $1 AND status = 'pending'",
      [userId]
    );

    if (pending.rows.length > 0) {
      return res.status(400).json({
        message: "You already have a pending withdrawal"
      });
    }

    // 3. Obtener balance
    const userResult = await db.query(
      "SELECT coins FROM users WHERE id = $1",
      [userId]
    );

    const balance = userResult.rows[0].coins;

    if (balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance"
      });
    }

    // 4. Crear retiro
    const withdrawalId = uuidv4();

    await db.query(
      `INSERT INTO withdrawals (id, user_id, amount, wallet_address)
       VALUES ($1, $2, $3, $4)`,
      [withdrawalId, userId, amount, wallet]
    );

    // 5. Descontar balance
    await db.query(
      "UPDATE users SET coins = coins - $1 WHERE id = $2",
      [amount, userId]
    );

    res.json({
      message: "Withdrawal request submitted"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error requesting withdrawal" });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT w.*, u.email 
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching withdrawals" });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    await db.query(
      `UPDATE withdrawals
       SET status = 'approved', processed_at = NOW()
       WHERE id = $1`,
      [withdrawalId]
    );

    res.json({ message: "Withdrawal approved" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving withdrawal" });
  }
};


exports.rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    // 1. Obtener retiro
    const result = await db.query(
      "SELECT * FROM withdrawals WHERE id = $1",
      [withdrawalId]
    );

    const withdrawal = result.rows[0];

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    // 2. Devolver dinero
    await db.query(
      "UPDATE users SET coins = coins + $1 WHERE id = $2",
      [withdrawal.amount, withdrawal.user_id]
    );

    // 3. Marcar rechazado
    await db.query(
      `UPDATE withdrawals
       SET status = 'rejected', processed_at = NOW()
       WHERE id = $1`,
      [withdrawalId]
    );

    res.json({ message: "Withdrawal rejected and refunded" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error rejecting withdrawal" });
  }
};