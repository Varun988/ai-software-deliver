const { generateWithModel } = require("../services/modelService");

async function runProductPlannerAgent(context) {
  const prompt = `
You are the Product Planner Agent in DevBand.
Convert this feature request into a structured software delivery plan.

Feature request:
${context.featureRequest}
`;

  const fallbackOutput = {
    userStory: `As a user, I want ${context.featureRequest}, so that the application becomes more useful and user-friendly.`,
    acceptanceCriteria: [
      "The feature should be visible and usable from the main interface.",
      "The feature should behave consistently after user interaction.",
      "The implementation should not break existing functionality.",
      "The feature should include basic validation or safe defaults where applicable."
    ],
    technicalTasks: [
      "Identify the frontend components affected by the feature.",
      "Create or update the required UI component.",
      "Add state management for user interaction.",
      "Persist user preference or feature state if required.",
      "Prepare test cases and documentation updates."
    ],
    risks: [
      "Feature behavior may be unclear without acceptance criteria.",
      "State persistence may behave differently across browsers.",
      "UI changes may impact accessibility if controls are not labelled."
    ],
    handoff: {
      nextAgent: "Software Engineer Agent",
      instruction: "Use the plan, acceptance criteria, and risks to generate implementation details."
    }
  };

  const modelResult = await generateWithModel({
    agentName: "Product Planner Agent",
    prompt,
    fallbackOutput
  });

  return {
    agent: "Product Planner Agent",
    stage: "planning",
    status: "completed",
    summary: "Converted the feature request into a structured product and technical plan.",
    output: modelResult.output,
    provider: modelResult.provider
  };
}

module.exports = {
  runProductPlannerAgent
};