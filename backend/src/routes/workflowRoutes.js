const express = require("express");
const { startWorkflow } = require("../services/workflowService");

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const { featureRequest } = req.body;

    if (!featureRequest || !featureRequest.trim()) {
      return res.status(400).json({
        error: "Feature request is required"
      });
    }

    const result = await startWorkflow(featureRequest.trim());

    res.json(result);
  } catch (error) {
    console.error("Workflow error:", error);

    res.status(500).json({
      error: "Failed to start DevBand workflow",
      details: error.message
    });
  }
});

module.exports = router;