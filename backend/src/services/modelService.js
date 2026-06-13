async function generateWithModel({ agentName, prompt, fallbackOutput }) {
  const agentMode = process.env.AGENT_MODE || "mock";

  if (agentMode === "mock") {
    return {
      provider: "mock",
      agentName,
      promptUsed: prompt,
      output: fallbackOutput
    };
  }

  return {
    provider: "mock_fallback",
    agentName,
    promptUsed: prompt,
    output: fallbackOutput
  };
}

module.exports = {
  generateWithModel
};