const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const dataRouter = require("./routes/item.route.js");

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cors());

// Connect DB
if (!process.env.MONGO_URI) {
  console.error("Please set MONGO_URI in .env");
  process.exit(1);
}
connectDB(process.env.MONGO_URI);

// API routes
app.use("/api/data", dataRouter);

// Status check
app.get("/api/status", (req, res) =>
  res.json({ app: "running", time: new Date() })
);

// Serve frontend (if built)
app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
