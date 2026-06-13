function getBandMode() {
  return process.env.BAND_MODE || "mock";
}

function getBandBaseUrl() {
  const rawBaseUrl = process.env.BAND_REST_URL || "https://app.band.ai";
  return rawBaseUrl.replace(/\/+$/, "");
}

function getBandApiBaseUrl() {
  return `${getBandBaseUrl()}/api/v1/agent`;
}

function getBandHeaders() {
  const apiKey = process.env.BAND_API_KEY;

  if (!apiKey) {
    throw new Error("BAND_API_KEY is missing");
  }

  return {
    "X-API-Key": apiKey,
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
    liveBand: false
  };
}

function createLocalBandMessage({ roomId, agent, stage, message, payload }) {
  return {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    roomId,
    agent,
    stage,
    message,
    payload,
    createdAt: new Date().toISOString(),
    liveBand: false
  };
}

function safeStringifyPayload(payload) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

function buildBandEventContent({ agent, stage, message, payload }) {
  const payloadText = safeStringifyPayload(payload);

  const content = `[${stage}] ${agent}: ${message}

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
  const url = `${getBandApiBaseUrl()}/chats`;

  const response = await fetch(url, {
    method: "POST",
    headers: getBandHeaders(),
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
    throw new Error(`Band create chat response did not include data.id`);
  }

  return {
    roomId: liveRoomId,
    roomName: `DevBand Delivery Room - ${workflowId}`,
    mode: "live",
    createdAt: data?.data?.inserted_at || new Date().toISOString(),
    topic: featureRequest,
    liveBand: true,
    bandRawResponse: data
  };
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

async function postLiveEventToBand({ room, agent, stage, message, payload }) {
  const url = `${getBandApiBaseUrl()}/chats/${room.roomId}/events`;

  const content = buildBandEventContent({
    agent,
    stage,
    message,
    payload
  });

  const response = await fetch(url, {
    method: "POST",
    headers: getBandHeaders(),
    body: JSON.stringify({
      event: {
        content,
        message_type: "task",
        metadata: {
          source: "DevBand",
          agent,
          stage,
          summary: message,
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
    bandRawResponse: data
  };
}

async function postAgentMessageToBand({ room, agent, stage, message, payload }) {
  const localMessage = createLocalBandMessage({
    roomId: room.roomId,
    agent,
    stage,
    message,
    payload
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
      payload
    });
  } catch (error) {
    console.error("[Band] Live event post failed. Using local fallback message.", {
      agent,
      stage,
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