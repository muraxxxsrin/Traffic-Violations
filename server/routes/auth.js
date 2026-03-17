import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getAccessTokenExpiresIn() {
  return process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
}

function getRefreshTokenExpiresIn() {
  return process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
}

function getJwtSecret() {
  return process.env.JWT_SECRET;
}

function getRefreshTokenSecret() {
  return process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
}

function createAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    getJwtSecret(),
    { expiresIn: getAccessTokenExpiresIn() }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, type: "refresh" },
    getRefreshTokenSecret(),
    { expiresIn: getRefreshTokenExpiresIn() }
  );
}

async function issueAuthTokens(user) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return {
    accessToken,
    refreshToken,
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
    const { accessToken, refreshToken } = await issueAuthTokens(user);
    logDuration("auth.signup.signJwt", tokenStart, { userId: String(user._id) });

    logDuration("auth.signup.total", requestStart, { status: 201, userId: String(user._id) });

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user),
      token: accessToken,
      accessToken,
      refreshToken,
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
    const { accessToken, refreshToken } = await issueAuthTokens(user);
    logDuration("auth.signin.signJwt", tokenStart, { userId: String(user._id) });

    logDuration("auth.signin.total", requestStart, { status: 200, userId: String(user._id) });

    return res.status(200).json({
      message: "Signed in successfully.",
      user: sanitizeUser(user),
      token: accessToken,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logDuration("auth.signin.total", requestStart, { status: 500, error: error.message });
    return res.status(500).json({ message: "Unable to sign in.", error: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  const requestStart = Date.now();
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
      logDuration("auth.refresh.total", requestStart, { status: 401, userId: decoded.id });
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const tokenStart = Date.now();
    const { accessToken, refreshToken: nextRefreshToken } = await issueAuthTokens(user);
    logDuration("auth.refresh.signJwt", tokenStart, { userId: String(user._id) });
    logDuration("auth.refresh.total", requestStart, { status: 200, userId: String(user._id) });

    return res.status(200).json({
      message: "Session refreshed successfully.",
      token: accessToken,
      accessToken,
      refreshToken: nextRefreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logDuration("auth.refresh.total", requestStart, { status: 401, error: error.message });
    return res.status(401).json({ message: "Refresh token expired or invalid." });
  }
});

router.post("/signout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(200).json({ message: "Signed out successfully." });
  }

  try {
    const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
    const user = await User.findById(decoded.id);

    if (user && user.refreshTokenHash === hashToken(refreshToken)) {
      user.refreshTokenHash = null;
      await user.save();
    }
  } catch (error) {
    console.warn("auth.signout token cleanup skipped:", error.message);
  }

  return res.status(200).json({ message: "Signed out successfully." });
});

export default router;
