const pool = require("./config/database");
const express = require("express");
const cors = require("cors");
require("dotenv").config();


const authRoutes = require("./routes/authRoutes");


const app = express();

const userRoutes = require("./routes/userRoutes");

const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));
 


pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error(err));

app.use(cors());
app.use(express.json());

const tasksRoutes = require("./routes/tasksRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const rateLimit = require("express-rate-limit");

const taskLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20
});

app.use("/api/tasks", taskLimiter);

const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

const withdrawalsRoutes = require("./routes/withdrawalsRoutes");

app.use("/api/withdrawals", withdrawalsRoutes);
