import express from "express";
import Violation from "../models/violation.js";
import User from "../models/user.js";
import authToken from "../middleware/auth.middleware.js";

const router = express.Router();

function logDuration(label, startTime, details = {}) {
  const durationMs = Date.now() - startTime;
  console.log(`[timing] ${label} completed in ${durationMs}ms`, details);
}

async function findChallans(query) {
  return Violation.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "cameras",
        localField: "camera_id",
        foreignField: "camera_id",
        as: "cameraDetails"
      }
    },
    {
      $unwind: {
        path: "$cameraDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        location_name: "$cameraDetails.location_name"
      }
    },
    {
      $project: {
        cameraDetails: 0
      }
    }
  ]);
}

async function findSignedInUser(req, res, requestStart, routeLabel) {
  const signedInUserLookupStart = Date.now();
  const signedInUser = await User.findById(req.user.id).select("phoneNumber");
  logDuration(`${routeLabel}.findSignedInUser`, signedInUserLookupStart, { userId: req.user.id });

  if (!signedInUser) {
    logDuration(`${routeLabel}.total`, requestStart, { status: 401, userId: req.user.id });
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  return signedInUser;
}

// LOGIN / VERIFY CHALLAN
router.post("/search", async (req, res) => {
  const { type, value } = req.body;

  let query = {};

  if (type === "challan") {
    query.challan_id = value;
  } else if (type === "vehicle") {
    query.plate_clean = value;
  } else if (type === "phone") {
    query.phone_number = value;
  }

  try {
    const challans = await findChallans(query);

    if (!challans.length) {
      return res.status(404).json({ message: "No record found" });
    }

    res.json(challans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:phoneNumber", authToken, async (req, res) => {
  const requestStart = Date.now();
  try {
    const signedInUser = await findSignedInUser(req, res, requestStart, "challan.user");
    if (!signedInUser) return;

    if (signedInUser.phoneNumber !== req.params.phoneNumber) {
      logDuration("challan.user.total", requestStart, { status: 403, userId: req.user.id });
      return res.status(403).json({ message: "Forbidden" });
    }

    const challanLookupStart = Date.now();
    const challans = await findChallans({ phone_number: req.params.phoneNumber });
    logDuration("challan.user.findChallans", challanLookupStart, {
      phoneNumber: req.params.phoneNumber,
      count: challans.length,
    });
    logDuration("challan.user.total", requestStart, {
      status: 200,
      phoneNumber: req.params.phoneNumber,
      count: challans.length,
    });
    return res.status(200).json(challans);
  } catch (error) {
    logDuration("challan.user.total", requestStart, { status: 500, error: error.message });
    return res.status(500).json({ message: "Unable to fetch user challans.", error: error.message });
  }
});
// PAY CHALLAN
router.put("/pay/:id", authToken, async (req, res) => {
  const requestStart = Date.now();
  try {
    const signedInUser = await findSignedInUser(req, res, requestStart, "challan.pay");
    if (!signedInUser) return;

    const existingChallan = await Violation.findOne({ challan_id: req.params.id }).lean();

    if (!existingChallan) {
      logDuration("challan.pay.total", requestStart, { status: 404, challanId: req.params.id });
      return res.status(404).json({ message: "Challan not found" });
    }

    if (existingChallan.phone_number !== signedInUser.phoneNumber) {
      logDuration("challan.pay.total", requestStart, {
        status: 403,
        userId: req.user.id,
        challanId: req.params.id,
      });
      return res.status(403).json({ message: "Forbidden" });
    }

    const challan = await Violation.findOneAndUpdate(
      { challan_id: req.params.id },
      {
        payment_status: "paid",
        paid_at: new Date(),
        status: "closed"
      },
      { new: true }
    );

    logDuration("challan.pay.total", requestStart, { status: 200, challanId: req.params.id });
    res.json(challan);
  } catch (err) {
    logDuration("challan.pay.total", requestStart, { status: 500, error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// SIMULATE PAYMENT
router.post("/simulate-payment", authToken, async (req, res) => {
  const requestStart = Date.now();
  try {
    const signedInUser = await findSignedInUser(req, res, requestStart, "challan.simulatePayment");
    if (!signedInUser) return;

    const { challan_id } = req.body;
    const existingChallan = await Violation.findOne({ challan_id }).lean();

    if (!existingChallan) {
      logDuration("challan.simulatePayment.total", requestStart, { status: 404, challanId: challan_id });
      return res.status(404).json({ message: "Challan not found in database" });
    }

    if (existingChallan.phone_number !== signedInUser.phoneNumber) {
      logDuration("challan.simulatePayment.total", requestStart, {
        status: 403,
        userId: req.user.id,
        challanId: challan_id,
      });
      return res.status(403).json({ message: "Forbidden" });
    }

    // Generate a fake payment transaction ID containing ONLY numbers
    const fake_payment_id = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    // Payment is "verified", update the challan
    const challan = await Violation.findOneAndUpdate(
      { challan_id: challan_id },
      {
        payment_status: "paid",
        payment_id: fake_payment_id,
        paid_at: "online",
        status: "closed"
      },
      { new: true }
    );

    logDuration("challan.simulatePayment.total", requestStart, {
      status: 200,
      challanId: challan_id,
      userId: req.user.id,
    });
    return res.status(200).json({
      message: "Mock payment verified successfully",
      challan: challan,
      payment_id: fake_payment_id
    });

  } catch (error) {
    logDuration("challan.simulatePayment.total", requestStart, { status: 500, error: error.message });
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
});

export default router;
