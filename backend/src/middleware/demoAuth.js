function isDemoAuthEnabled() {
  return String(process.env.DEMO_AUTH_ENABLED || "false").toLowerCase() === "true";
}

function demoAuth(req, res, next) {
  if (!isDemoAuthEnabled()) {
    return next();
  }

  const expectedToken = process.env.DEMO_SESSION_TOKEN;
  const receivedToken = req.header("X-Demo-Token");

  if (!expectedToken) {
    return res.status(500).json({
      error: "Demo auth is enabled but DEMO_SESSION_TOKEN is not configured"
    });
  }

  if (!receivedToken || receivedToken !== expectedToken) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Valid demo login is required to run DevBand workflows"
    });
  }

  return next();
}

module.exports = {
  demoAuth,
  isDemoAuthEnabled
};