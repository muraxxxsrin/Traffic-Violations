import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
const router = express.Router();

function logDuration(label, startTime, details = {}) {
  const durationMs = Date.now() - startTime;
  console.log(`[timing] ${label} completed in ${durationMs}ms`, details);
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}

router.post("/signup", async (req, res) => {
  const requestStart = Date.now();
  const { name, email, phoneNumber, password } = req.body;

  if (!name || !email || !phoneNumber || !password) {
    return res.status(400).json({ message: "Name, email, phone number, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
  }

  try {
    const existingUserLookupStart = Date.now();
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }],
    });
    logDuration("auth.signup.findExistingUser", existingUserLookupStart, { email: email.toLowerCase() });

    if (existingUser) {
      logDuration("auth.signup.total", requestStart, { status: 409, email: email.toLowerCase() });
      return res.status(409).json({ message: "An account with this email or phone number already exists." });
    }

    const hashStart = Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    logDuration("auth.signup.hashPassword", hashStart, { email: email.toLowerCase() });

    const createUserStart = Date.now();
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    logDuration("auth.signup.createUser", createUserStart, { userId: String(user._id) });

    const tokenStart = Date.now();
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    logDuration("auth.signup.signJwt", tokenStart, { userId: String(user._id) });

    logDuration("auth.signup.total", requestStart, { status: 201, userId: String(user._id) });

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    logDuration("auth.signup.total", requestStart, { status: 500, error: error.message });
    return res.status(500).json({ message: "Unable to create account.", error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const requestStart = Date.now();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const findUserStart = Date.now();
    const user = await User.findOne({ email: email.toLowerCase() });
    logDuration("auth.signin.findUser", findUserStart, { email: email.toLowerCase() });

    if (!user) {
      logDuration("auth.signin.total", requestStart, { status: 401, email: email.toLowerCase() });
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const comparePasswordStart = Date.now();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    logDuration("auth.signin.comparePassword", comparePasswordStart, { userId: String(user._id) });

    if (!isPasswordValid) {
      logDuration("auth.signin.total", requestStart, { status: 401, userId: String(user._id) });
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const tokenStart = Date.now();
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    logDuration("auth.signin.signJwt", tokenStart, { userId: String(user._id) });

    logDuration("auth.signin.total", requestStart, { status: 200, userId: String(user._id) });

    return res.status(200).json({
      message: "Signed in successfully.",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    logDuration("auth.signin.total", requestStart, { status: 500, error: error.message });
    return res.status(500).json({ message: "Unable to sign in.", error: error.message });
  }
});

export default router;
