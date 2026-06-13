const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const { demoAuth } = require("./middleware/demoAuth");

const workflowRoutes = require("./routes/workflowRoutes");

const app = express();

function normalizeOrigin(origin) {
  if (!origin) {
    return origin;
  }

  return origin.replace(/\/+$/, "");
}

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
]
  .filter(Boolean)
  .map(normalizeOrigin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    allowedHeaders: ["Content-Type", "X-Demo-Token"]
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

app.use("/api/auth", authRoutes);
app.use("/api/workflows", demoAuth, workflowRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DevBand backend running on port ${PORT}`);
});