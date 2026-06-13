const { generateWithModel } = require("../services/modelService");

async function runCodeReviewerAgent(context) {
  const prompt = `
You are the Code Reviewer Agent in DevBand.
Review the planner, engineer, and tester outputs.

Feature request:
${context.featureRequest}

Planner output:
${JSON.stringify(context.planningOutput.output, null, 2)}

Engineering output:
${JSON.stringify(context.engineeringOutput.output, null, 2)}

Testing output:
${JSON.stringify(context.testingOutput.output, null, 2)}
`;

  const fallbackOutput = {
    reviewStatus: "approved_with_suggestions",
    qualityScore: 8,
    maintainabilityFeedback: [
      "The feature logic is small enough for the MVP.",
      "If the feature grows, extract persistence logic into a custom React hook.",
      "Keep UI labels and localStorage keys consistent across the app."
    ],
    accessibilityFeedback: [
      "The button includes an aria-label, which is good.",
      "Consider adding visible text that clearly communicates the current state.",
      "Ensure keyboard focus styles are visible."
    ],
    securityFeedback: [
      "No sensitive data should be stored in localStorage.",
      "The persisted value should be treated as user preference only.",
      "Validate saved values before using them in application logic."
    ],
    blockingIssues: [],
    revisionRequired: false,
    handoff: {
      nextAgent: "Documentation Agent",
      instruction: "Prepare PR title, PR summary, README update, and release notes."
    }
  };

  const modelResult = await generateWithModel({
    agentName: "Code Reviewer Agent",
    prompt,
    fallbackOutput
  });

  return {
    agent: "Code Reviewer Agent",
    stage: "review",
    status: "completed",
    summary: "Reviewed the implementation and tests for quality, accessibility, maintainability, and security.",
    output: modelResult.output,
    provider: modelResult.provider
  };
}

module.exports = {
  runCodeReviewerAgent
};