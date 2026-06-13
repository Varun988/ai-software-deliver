const express = require("express");
const { isDemoAuthEnabled } = require("../middleware/demoAuth");

const router = express.Router();

router.post("/login", (req, res) => {
  const authEnabled = isDemoAuthEnabled();

  if (!authEnabled) {
    return res.json({
      authenticated: true,
      authEnabled: false,
      token: "demo-auth-disabled"
    });
  }

  const { username, password } = req.body;

  const expectedUsername = process.env.DEMO_USERNAME;
  const expectedPassword = process.env.DEMO_PASSWORD;
  const sessionToken = process.env.DEMO_SESSION_TOKEN;

  if (!expectedUsername || !expectedPassword || !sessionToken) {
    return res.status(500).json({
      error: "Demo auth environment variables are not fully configured"
    });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({
      error: "Invalid username or password"
    });
  }

  return res.json({
    authenticated: true,
    authEnabled: true,
    token: sessionToken
  });
});

module.exports = router;