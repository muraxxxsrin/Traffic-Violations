import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}

router.post("/signup", async (req, res) => {
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
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email or phone number already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create account.", error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Signed in successfully.",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to sign in.", error: error.message });
  }
});

export default router;
