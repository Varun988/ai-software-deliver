const { runProductPlannerAgent } = require("../agents/productPlannerAgent");
const {
  runSoftwareEngineerAgent,
  runSoftwareEngineerRevisionAgent
} = require("../agents/softwareEngineerAgent");

const { runTestEngineerAgent } = require("../agents/testEngineerAgent");
const { runCodeReviewerAgent } = require("../agents/codeReviewerAgent");
const { runDocumentationAgent } = require("../agents/documentationAgent");
const { createMockBandRoom, postAgentMessageToBand } = require("./bandService");

async function startWorkflow(featureRequest) {
  const workflowId = `wf_${Date.now()}`;

  const room = createMockBandRoom(workflowId, featureRequest);

  const initialContext = {
    workflowId,
    featureRequest,
    room,
    createdAt: new Date().toISOString(),
    status: "started"
  };

  const bandMessages = [];

  const workflowStartedMessage = await postAgentMessageToBand({
    room,
    agent: "Workflow Controller",
    stage: "start",
    message: "Created DevBand collaboration room and started software delivery workflow.",
    payload: {
      workflowId,
      featureRequest
    }
  });

  bandMessages.push(workflowStartedMessage);

  const planningOutput = await runProductPlannerAgent(initialContext);

  bandMessages.push(
    await postAgentMessageToBand({
      room,
      agent: planningOutput.agent,
      stage: planningOutput.stage,
      message: planningOutput.summary,
      payload: planningOutput.output
    })
  );

  const engineeringOutput = await runSoftwareEngineerAgent({
    ...initialContext,
    planningOutput
  });

  bandMessages.push(
    await postAgentMessageToBand({
      room,
      agent: engineeringOutput.agent,
      stage: engineeringOutput.stage,
      message: engineeringOutput.summary,
      payload: engineeringOutput.output
    })
  );

  const testingOutput = await runTestEngineerAgent({
    ...initialContext,
    planningOutput,
    engineeringOutput
  });

  bandMessages.push(
    await postAgentMessageToBand({
      room,
      agent: testingOutput.agent,
      stage: testingOutput.stage,
      message: testingOutput.summary,
      payload: testingOutput.output
    })
  );

  const reviewOutput = await runCodeReviewerAgent({
    ...initialContext,
    planningOutput,
    engineeringOutput,
    testingOutput
  });

  bandMessages.push(
    await postAgentMessageToBand({
      room,
      agent: reviewOutput.agent,
      stage: reviewOutput.stage,
      message: reviewOutput.summary,
      payload: reviewOutput.output
    })
  );

let revisionOutput = null;

if (
  reviewOutput.output.revisionRequired === true ||
  reviewOutput.output.reviewStatus === "approved_with_suggestions"
) {
  revisionOutput = await runSoftwareEngineerRevisionAgent({
    ...initialContext,
    planningOutput,
    engineeringOutput,
    testingOutput,
    reviewOutput
  });

  bandMessages.push(
    await postAgentMessageToBand({
      room,
      agent: revisionOutput.agent,
      stage: revisionOutput.stage,
      message: revisionOutput.summary,
      payload: revisionOutput.output
    })
  );
}

  const documentationOutput = await runDocumentationAgent({
    ...initialContext,
    planningOutput,
    engineeringOutput,
    testingOutput,
    reviewOutput,
    revisionOutput
  });

  bandMessages.push(
    await postAgentMessageToBand({
      room,
      agent: documentationOutput.agent,
      stage: documentationOutput.stage,
      message: documentationOutput.summary,
      payload: documentationOutput.output
    })
  );

  const workflowCompletedMessage = await postAgentMessageToBand({
    room,
    agent: "Workflow Controller",
    stage: "completed",
    message: "DevBand workflow completed. Final PR delivery package is ready.",
    payload: {
      workflowId,
      finalStatus: documentationOutput.output.finalStatus
    }
  });

  bandMessages.push(workflowCompletedMessage);

  return {
    workflowId,
    featureRequest,
    status: "completed",
    bandRoom: room,
    agents: [
      planningOutput,
      engineeringOutput,
      testingOutput,
      reviewOutput,
      ...(revisionOutput ? [revisionOutput] : []),
      documentationOutput
    ],
    bandMessages,
    finalPackage: documentationOutput.output
  };
}

module.exports = {
  startWorkflow
};