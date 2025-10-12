const express = require("express");
const router = express.Router();
const Item = require("../models/item.model.js");

// POST /api/data
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const receivedAt = payload.receivedAt
      ? new Date(payload.receivedAt)
      : new Date();

    const saved = await Item.create({ receivedAt, payload });

    res.status(201).json({ message: "Saved", id: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/data  -> optional: supports ?date=YYYY-MM-DD to filter
router.get("/", async (req, res) => {
  try {
    const { date } = req.query; // optional
    let query = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.receivedAt = { $gte: start, $lt: end };
    }
    const items = await Item.find(query).sort({ receivedAt: -1 }).limit(1000);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
