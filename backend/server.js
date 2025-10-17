const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const dataRouter = require("./routes/item.route.js");

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// ---------- Middleware ----------
app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: ["http://localhost:3001", "https://chronos-23lh.onrender.com"],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// ---------- Connect MongoDB ----------
if (!process.env.MONGO_URI) {
  console.error("❌ Please set MONGO_URI in .env");
  process.exit(1);
}
connectDB(process.env.MONGO_URI);

// ---------- API Routes ----------
app.use("/api/data", dataRouter);

// Health check
app.get("/api/status", (req, res) => {
  res.json({ app: "running", time: new Date() });
});

// ---------- Serve Frontend Build ----------
app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

// ✅ Express v5-compatible catch-all route (fix for “Missing parameter name” error)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
});

// ---------- Start Server ----------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
