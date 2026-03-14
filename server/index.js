import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import challanRoutes from "./routes/challan.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then((conn) => console.log(`MongoDB Connected to host: ${conn.connection.host}`))
    .catch(err => console.log(err));

app.use("/api/challan", challanRoutes);
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
