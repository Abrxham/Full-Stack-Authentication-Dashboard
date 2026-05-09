const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");


// 🔹 GET TASKS
exports.getTasks = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM tasks WHERE active = true"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting tasks" });
  }
};


// 🔹 START TASK (NUEVO)
exports.startTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.body;

    // 1. Verificar tarea
    const taskResult = await db.query(
      "SELECT * FROM tasks WHERE id = $1 AND active = true",
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskResult.rows[0];

    // 2. Crear token seguro
    const token = crypto.randomBytes(32).toString("hex");

    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + task.duration * 1000);

    // 3. Guardar sesión
    await db.query(
      `INSERT INTO task_sessions 
      (id, user_id, task_id, started_at, expires_at, token)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [sessionId, userId, taskId, now, expiresAt, token]
    );

    res.json({
      message: "Task started",
      sessionToken: token,
      expiresAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting task" });
  }
};


// 🔹 COMPLETE TASK (REEMPLAZA EL TUYO)
exports.completeTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionToken } = req.body;

    // 1. Buscar sesión + reward
    const result = await db.query(`
      SELECT ts.*, t.reward
      FROM task_sessions ts
      JOIN tasks t ON ts.task_id = t.id
      WHERE ts.token = $1
    `, [sessionToken]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    const session = result.rows[0];

    // 2. Validaciones de seguridad 🔐

    if (session.user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (session.completed) {
      return res.status(400).json({ message: "Task already completed" });
    }

    // ⏱️ Anti-trampa
    if (new Date() < session.expires_at) {
      return res.status(400).json({ message: "Task not finished yet" });
    }

    // 3. Límite diario (reutilizamos tu lógica)
    const userResult = await db.query(
      "SELECT level_id FROM users WHERE id = $1",
      [userId]
    );

    const levelId = userResult.rows[0].level_id;

    const levelResult = await db.query(
      "SELECT daily_tasks FROM levels WHERE id = $1",
      [levelId]
    );

    const dailyLimit = levelResult.rows[0].daily_tasks;

    const countResult = await db.query(
      `SELECT COUNT(*) FROM user_tasks 
       WHERE user_id = $1 
       AND DATE(completed_at) = CURRENT_DATE`,
      [userId]
    );

    const tasksToday = parseInt(countResult.rows[0].count);

    if (tasksToday >= dailyLimit) {
      return res.status(400).json({ message: "Daily limit reached" });
    }

    // 4. Marcar sesión como completada
    await db.query(
      "UPDATE task_sessions SET completed = true WHERE token = $1",
      [sessionToken]
    );

    // 5. Guardar historial
    await db.query(
      `INSERT INTO user_tasks (user_id, task_id, completed_at)
       VALUES ($1, $2, NOW())`,
      [userId, session.task_id]
    );

    // 6. Sumar coins
    await db.query(
      "UPDATE users SET coins = coins + $1 WHERE id = $2",
      [session.reward, userId]
    );

    res.json({
      message: "Task completed",
      reward: session.reward
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing task" });
  }
};