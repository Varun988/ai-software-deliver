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

async function runSoftwareEngineerRevisionAgent(context) {
  const prompt = `
You are the Software Engineer Agent in DevBand.
The Code Reviewer Agent has reviewed your implementation and provided suggestions.
Create a revised implementation response that addresses the review feedback.

Feature request:
${context.featureRequest}

Original engineering output:
${JSON.stringify(context.engineeringOutput.output, null, 2)}

Review output:
${JSON.stringify(context.reviewOutput.output, null, 2)}
`;

  const fallbackOutput = {
    revisionSummary:
      "Updated the implementation plan to address reviewer feedback around maintainability, accessibility, and safe persistence.",
    changesApplied: [
      "Added recommendation to extract persistence logic into a reusable custom hook.",
      "Kept aria-label support for the interactive control.",
      "Added validation guidance for localStorage values.",
      "Clarified that localStorage should only store non-sensitive user preferences."
    ],
    revisedCodeSnippet: `import { useEffect, useState } from "react";

function usePersistentBooleanPreference(key, defaultValue = false) {
  const [value, setValue] = useState(() => {
    const savedValue = localStorage.getItem(key);

    if (savedValue === "true") return true;
    if (savedValue === "false") return false;

    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue];
}

function DevBandFeatureToggle() {
  const [enabled, setEnabled] = usePersistentBooleanPreference(
    "devband-feature-enabled",
    false
  );

  return (
    <button
      type="button"
      aria-label="Toggle feature preference"
      onClick={() => setEnabled((current) => !current)}
    >
      {enabled ? "Feature Enabled" : "Feature Disabled"}
    </button>
  );
}

export default DevBandFeatureToggle;`,
    resolvedReviewItems: [
      "Maintainability improved through reusable hook pattern.",
      "Accessibility label retained and made more descriptive.",
      "Invalid persisted values now fall back safely to the default value.",
      "Security guidance clarified for non-sensitive localStorage usage."
    ],
    handoff: {
      nextAgent: "Documentation Agent",
      instruction:
        "Use the revised implementation and review resolution notes to prepare the final PR package."
    }
  };

  const modelResult = await generateWithModel({
    agentName: "Software Engineer Revision Agent",
    prompt,
    fallbackOutput
  });

  return {
    agent: "Software Engineer Revision Agent",
    stage: "revision",
    status: "completed",
    summary:
      "Revised the implementation after code review feedback and resolved non-blocking review suggestions.",
    output: modelResult.output,
    provider: modelResult.provider
  };
}

module.exports = {
  runSoftwareEngineerAgent,
  runSoftwareEngineerRevisionAgent
};