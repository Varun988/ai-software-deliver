const { generateWithModel } = require("../services/modelService");

async function runSoftwareEngineerAgent(context) {
  const prompt = `
You are the Software Engineer Agent in DevBand.
Generate implementation details based on the planner output.

Feature request:
${context.featureRequest}

Planner output:
${JSON.stringify(context.planningOutput.output, null, 2)}
`;

  const fallbackOutput = {
    filesChanged: [
      "src/App.jsx",
      "src/components/DevBandFeatureToggle.jsx",
      "src/index.css"
    ],
    implementationSummary:
      "Added a reusable UI control, state handling, and persistence-friendly implementation approach.",
    codeSnippet: `import { useEffect, useState } from "react";

function DevBandFeatureToggle() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("devband-feature-enabled") === "true";
  });

  useEffect(() => {
    localStorage.setItem("devband-feature-enabled", String(enabled));
  }, [enabled]);

  return (
    <button
      type="button"
      aria-label="Toggle feature"
      onClick={() => setEnabled((current) => !current)}
    >
      {enabled ? "Feature Enabled" : "Feature Disabled"}
    </button>
  );
}

export default DevBandFeatureToggle;`,
    assumptions: [
      "The application is a React frontend.",
      "Browser localStorage is acceptable for lightweight preference persistence.",
      "The feature can be implemented without backend database changes for the MVP."
    ],
    handoff: {
      nextAgent: "Test Engineer Agent",
      instruction: "Create unit, integration, and manual QA scenarios for the generated implementation."
    }
  };

  const modelResult = await generateWithModel({
    agentName: "Software Engineer Agent",
    prompt,
    fallbackOutput
  });

  return {
    agent: "Software Engineer Agent",
    stage: "implementation",
    status: "completed",
    summary: "Generated implementation approach and sample React code.",
    output: modelResult.output,
    provider: modelResult.provider
  };
}

module.exports = {
  runSoftwareEngineerAgent
};