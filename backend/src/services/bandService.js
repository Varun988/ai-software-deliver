function getBandMode() {
  return process.env.BAND_MODE || "mock";
}

function isMultiAgentBandMode() {
  return String(process.env.BAND_MULTI_AGENT_MODE || "false").toLowerCase() === "true";
}

function getBandBaseUrl() {
  const rawBaseUrl = process.env.BAND_REST_URL || "https://app.band.ai";
  return rawBaseUrl.replace(/\/+$/, "");
}

function getBandApiBaseUrl() {
  return `${getBandBaseUrl()}/api/v1/agent`;
}

function getCoordinatorConfig() {
  return {
    role: "coordinator",
    displayName: "Workflow Controller",
    apiKey: process.env.BAND_COORDINATOR_API_KEY || process.env.BAND_API_KEY,
    id: process.env.BAND_COORDINATOR_AGENT_ID || process.env.BAND_AGENT_ID,
    handle:
      process.env.BAND_COORDINATOR_AGENT_HANDLE ||
      process.env.BAND_AGENT_HANDLE
  };
}

const AGENT_ROLE_MAP = {
  "Product Planner Agent": {
    role: "planner",
    displayName: "Product Planner Agent",
    apiKeyEnv: "BAND_PLANNER_API_KEY",
    idEnv: "BAND_PLANNER_AGENT_ID",
    handleEnv: "BAND_PLANNER_AGENT_HANDLE"
  },
  "Software Engineer Agent": {
    role: "engineer",
    displayName: "Software Engineer Agent",
    apiKeyEnv: "BAND_ENGINEER_API_KEY",
    idEnv: "BAND_ENGINEER_AGENT_ID",
    handleEnv: "BAND_ENGINEER_AGENT_HANDLE"
  },
  "Test Engineer Agent": {
    role: "tester",
    displayName: "Test Engineer Agent",
    apiKeyEnv: "BAND_TESTER_API_KEY",
    idEnv: "BAND_TESTER_AGENT_ID",
    handleEnv: "BAND_TESTER_AGENT_HANDLE"
  },
  "Code Reviewer Agent": {
    role: "reviewer",
    displayName: "Code Reviewer Agent",
    apiKeyEnv: "BAND_REVIEWER_API_KEY",
    idEnv: "BAND_REVIEWER_AGENT_ID",
    handleEnv: "BAND_REVIEWER_AGENT_HANDLE"
  },
  "Software Engineer Revision Agent": {
    role: "revision",
    displayName: "Software Engineer Revision Agent",
    apiKeyEnv: "BAND_REVISION_API_KEY",
    idEnv: "BAND_REVISION_AGENT_ID",
    handleEnv: "BAND_REVISION_AGENT_HANDLE"
  },
  "Documentation Agent": {
    role: "docs",
    displayName: "Documentation Agent",
    apiKeyEnv: "BAND_DOCS_API_KEY",
    idEnv: "BAND_DOCS_AGENT_ID",
    handleEnv: "BAND_DOCS_AGENT_HANDLE"
  }
};

function getBandAgentConfig(agentName) {
  if (agentName === "Workflow Controller") {
    return getCoordinatorConfig();
  }

  const roleConfig = AGENT_ROLE_MAP[agentName];

  if (!roleConfig || !isMultiAgentBandMode()) {
    return getCoordinatorConfig();
  }

  const apiKey = process.env[roleConfig.apiKeyEnv];
  const id = process.env[roleConfig.idEnv];
  const handle = process.env[roleConfig.handleEnv];

  if (!apiKey || !id) {
    return {
      ...getCoordinatorConfig(),
      role: `${roleConfig.role}_fallback_to_coordinator`,
      displayName: roleConfig.displayName,
      missingSpecialistConfig: true
    };
  }

  return {
    role: roleConfig.role,
    displayName: roleConfig.displayName,
    apiKey,
    id,
    handle
  };
}

function getAllSpecialistAgentConfigs() {
  if (!isMultiAgentBandMode()) {
    return [];
  }

  return Object.values(AGENT_ROLE_MAP)
    .map((roleConfig) => {
      const apiKey = process.env[roleConfig.apiKeyEnv];
      const id = process.env[roleConfig.idEnv];
      const handle = process.env[roleConfig.handleEnv];

      if (!apiKey || !id) {
        return null;
      }

      return {
        role: roleConfig.role,
        displayName: roleConfig.displayName,
        apiKey,
        id,
        handle
      };
    })
    .filter(Boolean);
}

function getBandHeadersForConfig(agentConfig) {
  if (!agentConfig?.apiKey) {
    throw new Error(`Band API key is missing for ${agentConfig?.displayName || "unknown agent"}`);
  }

  return {
    "X-API-Key": agentConfig.apiKey,
    "Content-Type": "application/json"
  };
}

function createLocalBandRoom(workflowId, featureRequest, mode = "mock") {
  return {
    roomId: `band_room_${workflowId}`,
    roomName: `DevBand Delivery Room - ${workflowId}`,
    mode,
    createdAt: new Date().toISOString(),
    topic: featureRequest,
    liveBand: false,
    multiAgentMode: isMultiAgentBandMode(),
    participants: []
  };
}

function createLocalBandMessage({
  roomId,
  agent,
  stage,
  message,
  payload,
  bandAgentConfig
}) {
  return {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    roomId,
    agent,
    stage,
    message,
    payload,
    createdAt: new Date().toISOString(),
    liveBand: false,
    bandAgentRole: bandAgentConfig?.role,
    bandAgentId: bandAgentConfig?.id,
    bandAgentHandle: bandAgentConfig?.handle,
    postedAs: bandAgentConfig?.displayName || agent
  };
}

function safeStringifyPayload(payload) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

function buildBandEventContent({ agent, stage, message, payload, bandAgentConfig }) {
  const payloadText = safeStringifyPayload(payload);

  const content = `[${stage}] ${agent}: ${message}

Posted as Band agent:
${bandAgentConfig?.displayName || agent}
${bandAgentConfig?.handle ? `Handle: ${bandAgentConfig.handle}` : ""}

Structured payload:
${payloadText}`;

  const maxLength = 12000;

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength)}

[DevBand note: Band event content was trimmed to stay within safe payload size.]`;
}

async function createLiveBandRoom(workflowId, featureRequest) {
  const coordinatorConfig = getCoordinatorConfig();
  const url = `${getBandApiBaseUrl()}/chats`;

  const response = await fetch(url, {
    method: "POST",
    headers: getBandHeadersForConfig(coordinatorConfig),
    body: JSON.stringify({
      chat: {}
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Band create chat failed with status ${response.status}: ${responseText}`
    );
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Band create chat returned non-JSON response: ${responseText}`);
  }

  const liveRoomId = data?.data?.id;

  if (!liveRoomId) {
    throw new Error("Band create chat response did not include data.id");
  }

  const room = {
    roomId: liveRoomId,
    roomName: `DevBand Delivery Room - ${workflowId}`,
    mode: "live",
    createdAt: data?.data?.inserted_at || new Date().toISOString(),
    topic: featureRequest,
    liveBand: true,
    multiAgentMode: isMultiAgentBandMode(),
    coordinator: {
      role: coordinatorConfig.role,
      id: coordinatorConfig.id,
      handle: coordinatorConfig.handle,
      displayName: coordinatorConfig.displayName
    },
    participants: [],
    participantAddResults: [],
    bandRawResponse: data
  };

  if (isMultiAgentBandMode()) {
    const specialistAgents = getAllSpecialistAgentConfigs();

    for (const specialistAgent of specialistAgents) {
      const result = await addParticipantToBandRoom(room, specialistAgent);
      room.participantAddResults.push(result);

      if (result.success) {
        room.participants.push({
          role: specialistAgent.role,
          id: specialistAgent.id,
          handle: specialistAgent.handle,
          displayName: specialistAgent.displayName
        });
      }
    }
  }

  return room;
}

async function addParticipantToBandRoom(room, participantAgent) {
  const coordinatorConfig = getCoordinatorConfig();
  const url = `${getBandApiBaseUrl()}/chats/${room.roomId}/participants`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getBandHeadersForConfig(coordinatorConfig),
      body: JSON.stringify({
        participant: {
          participant_id: participantAgent.id
        }
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        role: participantAgent.role,
        id: participantAgent.id,
        handle: participantAgent.handle,
        displayName: participantAgent.displayName,
        error: `Band add participant failed with status ${response.status}: ${responseText}`
      };
    }

    let data = null;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    return {
      success: true,
      role: participantAgent.role,
      id: participantAgent.id,
      handle: participantAgent.handle,
      displayName: participantAgent.displayName,
      bandRawResponse: data
    };
  } catch (error) {
    return {
      success: false,
      role: participantAgent.role,
      id: participantAgent.id,
      handle: participantAgent.handle,
      displayName: participantAgent.displayName,
      error: error.message
    };
  }
}

async function createBandRoom(workflowId, featureRequest) {
  const mode = getBandMode();

  if (mode !== "live") {
    return createLocalBandRoom(workflowId, featureRequest, "mock");
  }

  try {
    return await createLiveBandRoom(workflowId, featureRequest);
  } catch (error) {
    console.error("[Band] Live room creation failed. Falling back to mock room.", {
      message: error.message
    });

    return {
      ...createLocalBandRoom(workflowId, featureRequest, "mock_fallback_after_band_error"),
      bandError: error.message
    };
  }
}

async function postLiveEventToBand({
  room,
  agent,
  stage,
  message,
  payload,
  bandAgentConfig
}) {
  const url = `${getBandApiBaseUrl()}/chats/${room.roomId}/events`;

  const content = buildBandEventContent({
    agent,
    stage,
    message,
    payload,
    bandAgentConfig
  });

  const response = await fetch(url, {
    method: "POST",
    headers: getBandHeadersForConfig(bandAgentConfig),
    body: JSON.stringify({
      event: {
        content,
        message_type: "task",
        metadata: {
          source: "DevBand",
          agent,
          stage,
          summary: message,
          bandAgentRole: bandAgentConfig?.role,
          bandAgentId: bandAgentConfig?.id,
          bandAgentHandle: bandAgentConfig?.handle,
          postedAs: bandAgentConfig?.displayName || agent,
          payload
        }
      }
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Band create event failed with status ${response.status}: ${responseText}`
    );
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Band create event returned non-JSON response: ${responseText}`);
  }

  return {
    id: data?.data?.id || `band_event_${Date.now()}`,
    roomId: room.roomId,
    agent,
    stage,
    message,
    payload,
    createdAt: new Date().toISOString(),
    liveBand: true,
    bandMessageType: data?.data?.message_type,
    bandSuccess: data?.data?.success,
    bandAgentRole: bandAgentConfig?.role,
    bandAgentId: bandAgentConfig?.id,
    bandAgentHandle: bandAgentConfig?.handle,
    postedAs: bandAgentConfig?.displayName || agent,
    missingSpecialistConfig: bandAgentConfig?.missingSpecialistConfig || false,
    bandRawResponse: data
  };
}

async function postAgentMessageToBand({ room, agent, stage, message, payload }) {
  const bandAgentConfig = getBandAgentConfig(agent);

  const localMessage = createLocalBandMessage({
    roomId: room.roomId,
    agent,
    stage,
    message,
    payload,
    bandAgentConfig
  });

  if (getBandMode() !== "live" || !room.liveBand) {
    return localMessage;
  }

  try {
    return await postLiveEventToBand({
      room,
      agent,
      stage,
      message,
      payload,
      bandAgentConfig
    });
  } catch (error) {
    console.error("[Band] Live event post failed. Using local fallback message.", {
      agent,
      stage,
      postedAs: bandAgentConfig?.displayName,
      message: error.message
    });

    return {
      ...localMessage,
      liveBand: false,
      bandError: error.message
    };
  }
}

module.exports = {
  createBandRoom,
  postAgentMessageToBand
};