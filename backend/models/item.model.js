const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    receivedAt: { type: Date, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
