const Item = require("../models/item.model.js");

// Create (POST /api/data)
exports.createItem = async (req, res) => {
  try {
    const payload = req.body;
    const receivedAt = payload.receivedAt
      ? new Date(payload.receivedAt)
      : new Date();

    const saved = await Item.create({ receivedAt, payload });
    res.status(201).json({ message: "Saved", id: saved._id });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ error: "Server error while saving item" });
  }
};

// Read (GET /api/data?date=YYYY-MM-DD)
exports.getItems = async (req, res) => {
  try {
    const { date } = req.query;
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
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error while fetching data" });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error while deleting item" });
  }
};