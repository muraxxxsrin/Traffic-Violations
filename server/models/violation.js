import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({}, { strict: false });

const Violation = mongoose.model("Violation", violationSchema, "violations");

export default Violation;
