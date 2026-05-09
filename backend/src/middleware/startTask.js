const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const pool = require("../config/database");  // tu conexión a PostgreSQL

exports.startTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.body;

        // 1. Verificar que la tarea existe y está activa
        const taskResult = await pool.query(
            "SELECT * FROM tasks WHERE id = $1 AND active = true",
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found or inactive" });
        }

        const task = taskResult.rows[0];

        // 2. Generar token seguro
        const token = crypto.randomBytes(32).toString("hex");
        
        // ⏳ Cooldown de 5 segundos entre tareas
        const lastTask = await pool.query(`
         SELECT completed_at FROM user_tasks
         WHERE user_id = $1
         ORDER BY completed_at DESC
         LIMIT 1
         `, [userId]);

          if (lastTask.rows.length > 0) {
          const lastTime = new Date(lastTask.rows[0].completed_at);
            const now = new Date();

            const diff = (now - lastTime) / 1000;

            if (diff < 5) {
           return res.status(400).json({
              message: "Wait before starting another task"
           });
        }
    }
        
        // 3. Crear sesión
        const sessionId = uuidv4();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + task.duration * 1000);

        // 4. Guardar en DB
        await pool.query(
            `INSERT INTO task_sessions 
            (id, user_id, task_id, started_at, expires_at, token)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [sessionId, userId, taskId, now, expiresAt, token]
        );

        // 5. Respuesta
        res.json({
            message: "Task session started",
            sessionToken: token,
            expiresAt
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// 🚫 Verificar si ya tiene sesión activa
const activeSession = await pool.query(`
  SELECT * FROM task_sessions
  WHERE user_id = $1
  AND completed = false
  AND expires_at > NOW()
`, [userId]);

if (activeSession.rows.length > 0) {
  return res.status(400).json({
    message: "You already have an active task"
  });
}

await pool.query(`
  DELETE FROM task_sessions
  WHERE expires_at < NOW() AND completed = false
`);