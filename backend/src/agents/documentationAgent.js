const { generateWithModel } = require("../services/modelService");

async function runDocumentationAgent(context) {
  const prompt = `
You are the Documentation Agent in DevBand.
Create a final PR delivery package from all prior agent outputs.

Feature request:
${context.featureRequest}

Planner output:
${JSON.stringify(context.planningOutput.output, null, 2)}

Engineering output:
${JSON.stringify(context.engineeringOutput.output, null, 2)}

Testing output:
${JSON.stringify(context.testingOutput.output, null, 2)}

Review output:
${JSON.stringify(context.reviewOutput.output, null, 2)}

Revision output:
${JSON.stringify(context.revisionOutput?.output || null, null, 2)}
`;

  const fallbackOutput = {
    prTitle: "Implement user-requested frontend feature with persistent state",
    prSummary: `This pull request implements the requested feature: ${context.featureRequest}. The change includes a structured implementation plan, React component approach, validation scenarios, review feedback, and documentation-ready release notes.`,
    developerNotes: [
      "The implementation uses React state for immediate UI updates.",
      "The implementation uses localStorage for lightweight persistence.",
      "The reviewer suggestions were handled through an engineer revision loop.",
      "The feature should be reviewed again if persistence requirements become more complex."
    ],
    releaseNotes: [
      "Added a new user-facing feature control.",
      "Added persistence-friendly behavior for user preference.",
      "Prepared test scenarios and QA checklist for validation.",
      "Completed code review with no blocking issues.",
      "Resolved review suggestions through a revision handoff before final documentation."
    ],
    readmeUpdate: `## New Feature

This update adds support for the requested feature:

${context.featureRequest}

### Validation

- Confirm the feature control is visible.
- Confirm the UI updates after interaction.
- Confirm expected behavior remains after refresh.
- Confirm there are no console errors.

### Review Status

Approved with suggestions. No blocking issues found.
`,
    finalStatus: "ready_for_submission"
  };

  const modelResult = await generateWithModel({
    agentName: "Documentation Agent",
    prompt,
    fallbackOutput
  });

  return {
    agent: "Documentation Agent",
    stage: "documentation",
    status: "completed",
    summary: "Prepared the final PR-style delivery package and release notes.",
    output: modelResult.output,
    provider: modelResult.provider
  };
}

module.exports = {
  runDocumentationAgent
};