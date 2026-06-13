const express = require("express");
const cors = require("cors");
require("dotenv").config();

const workflowRoutes = require("./routes/workflowRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "DevBand API",
    status: "running",
    message: "Multi-agent software delivery backend is live",
    mode: {
      agentMode: process.env.AGENT_MODE || "mock",
      bandMode: process.env.BAND_MODE || "mock"
    }
  });
});

app.use("/api/workflows", workflowRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DevBand backend running on port ${PORT}`);
});