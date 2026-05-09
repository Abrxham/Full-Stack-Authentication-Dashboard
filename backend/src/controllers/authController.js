const pool = require("../config/database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // verificar telefono validado
    const verification = await pool.query(
      `SELECT verified
       FROM phone_verifications
       WHERE phone = $1
       AND verified = true
       AND expires_at > NOW()
       ORDER BY expires_at DESC
       LIMIT 1`,
      [phone]
    );

    if (verification.rows.length === 0) {
      return res.status(400).json({
        message: "Phone not verified"
      });
    }

    // verificar usuario existente
    const existingUser = await pool.query(
      `SELECT id FROM users
       WHERE email = $1 OR phone = $2
       LIMIT 1`,
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const referralCode = `${username}${Math.floor(Math.random() * 10000)}`;

    const result = await pool.query(
      `INSERT INTO users
       (id, username, email, phone, password_hash, referral_code)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, username, email, phone`,
      [id, username, email, phone, hashedPassword, referralCode]
    );

    // borrar verificacion
    await pool.query(
      "DELETE FROM phone_verifications WHERE phone = $1",
      [phone]
    );

    res.status(201).json({
      message: "User registered",
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Registration failed"
    });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Login failed"
    });
  }
};


// ================= SEND CODE =================
exports.sendPhoneCode = async (req, res) => {
  try {

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone required"
      });
    }

    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await pool.query(
      `INSERT INTO phone_verifications
       (phone, code, expires_at)
       VALUES ($1,$2,NOW() + INTERVAL '5 minutes')`,
      [phone, code]
    );

    console.log("SMS CODE:", code);

    res.json({
      message: "Code sent"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error sending code"
    });
  }
};


// ================= VERIFY =================
exports.verifyPhoneCode = async (req, res) => {
  try {

    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        message: "Phone and code required"
      });
    }

    const result = await pool.query(
      `SELECT id
       FROM phone_verifications
       WHERE phone = $1
       AND code = $2
       AND expires_at > NOW()
       LIMIT 1`,
      [phone, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid code"
      });
    }

    await pool.query(
      `UPDATE phone_verifications
       SET verified = true
       WHERE phone = $1`,
      [phone]
    );

    res.json({
      message: "Phone verified"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Verify error"
    });
  }
};
