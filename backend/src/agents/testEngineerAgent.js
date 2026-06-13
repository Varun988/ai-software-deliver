const { generateWithModel } = require("../services/modelService");

async function runTestEngineerAgent(context) {
  const prompt = `
You are the Test Engineer Agent in DevBand.
Create tests and QA checks based on the implementation output.

Feature request:
${context.featureRequest}

Implementation output:
${JSON.stringify(context.engineeringOutput.output, null, 2)}
`;

  const fallbackOutput = {
    unitTestIdeas: [
      "Should render the feature control without crashing.",
      "Should show the default disabled state when no saved preference exists.",
      "Should toggle state when the user clicks the control.",
      "Should persist the updated state to localStorage."
    ],
    integrationTestIdeas: [
      "Should update the visible UI immediately after interaction.",
      "Should restore the saved state after page refresh.",
      "Should not affect unrelated dashboard components."
    ],
    manualQaChecklist: [
      "Open the application.",
      "Confirm the feature control is visible.",
      "Click the feature control.",
      "Refresh the browser.",
      "Confirm the selected state remains active.",
      "Open browser console and confirm there are no errors."
    ],
    edgeCases: [
      "localStorage is unavailable or blocked.",
      "Saved localStorage value is invalid.",
      "User rapidly toggles the control multiple times.",
      "Feature is rendered on smaller screen sizes."
    ],
    handoff: {
      nextAgent: "Code Reviewer Agent",
      instruction: "Review implementation and test strategy for quality, maintainability, and accessibility."
    }
  };

  const modelResult = await generateWithModel({
    agentName: "Test Engineer Agent",
    prompt,
    fallbackOutput
  });

  return {
    agent: "Test Engineer Agent",
    stage: "testing",
    status: "completed",
    summary: "Created unit test ideas, integration checks, edge cases, and manual QA checklist.",
    output: modelResult.output,
    provider: modelResult.provider
  };
}

module.exports = {
  runTestEngineerAgent
};
