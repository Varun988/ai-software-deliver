function createMockBandRoom(workflowId, featureRequest) {
  return {
    roomId: `band_room_${workflowId}`,
    roomName: `DevBand Delivery Room - ${workflowId}`,
    mode: process.env.BAND_MODE || "mock",
    createdAt: new Date().toISOString(),
    topic: featureRequest
  };
}

function createBandMessage({ roomId, agent, stage, message, payload }) {
  return {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    roomId,
    agent,
    stage,
    message,
    payload,
    createdAt: new Date().toISOString()
  };
}

async function postAgentMessageToBand({ room, agent, stage, message, payload }) {
  const bandMessage = createBandMessage({
    roomId: room.roomId,
    agent,
    stage,
    message,
    payload
  });

  return bandMessage;
}

module.exports = {
  createMockBandRoom,
  postAgentMessageToBand
};