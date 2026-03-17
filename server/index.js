import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import challanRoutes from "./routes/challan.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
console.log("JWT loaded?", Boolean(process.env.JWT_SECRET));

app.use(cors());
app.use(express.json());

app.use("/api/challan", challanRoutes);
app.use("/api/auth", authRoutes);

mongoose.set("bufferCommands", false);

async function startServer() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected to host: ${conn.connection.host}`);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
