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
    const signedInUserLookupStart = Date.now();
    const signedInUser = await User.findById(req.user.id).select("phoneNumber");
    logDuration("challan.user.findSignedInUser", signedInUserLookupStart, { userId: req.user.id });

    if (!signedInUser) {
      logDuration("challan.user.total", requestStart, { status: 401, userId: req.user.id });
      return res.status(401).json({ message: "Unauthorized" });
    }

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
router.put("/pay/:id", async (req, res) => {
  try {
    const challan = await Violation.findOneAndUpdate(
      { challan_id: req.params.id },
      {
        payment_status: "paid",
        paid_at: new Date(),
        status: "closed"
      },
      { new: true }
    );

    res.json(challan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIMULATE PAYMENT
router.post("/simulate-payment", async (req, res) => {
  try {
    const { challan_id } = req.body;

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
    if (!challan) {
      return res.status(404).json({ message: "Challan not found in database" });
    }

    return res.status(200).json({
      message: "Mock payment verified successfully",
      challan: challan,
      payment_id: fake_payment_id
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
});

export default router;
