const aiUsageState = {
  date: new Date().toISOString().slice(0, 10),
  requestCount: 0,
  cache: new Map()
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function resetDailyCounterIfNeeded() {
  const today = getTodayKey();

  if (aiUsageState.date !== today) {
    aiUsageState.date = today;
    aiUsageState.requestCount = 0;
    aiUsageState.cache.clear();
  }
}

function getNumberEnv(name, fallbackValue) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function buildChatCompletionsUrl(baseUrl) {
  if (!baseUrl) {
    throw new Error("AIML_BASE_URL is missing");
  }

  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  if (cleanBaseUrl.endsWith("/chat/completions")) {
    return cleanBaseUrl;
  }

  if (cleanBaseUrl.endsWith("/v1")) {
    return `${cleanBaseUrl}/chat/completions`;
  }

  return `${cleanBaseUrl}/v1/chat/completions`;
}

function trimPromptIfNeeded(prompt) {
  const maxPromptChars = getNumberEnv("AIML_MAX_PROMPT_CHARS", 12000);

  if (prompt.length <= maxPromptChars) {
    return prompt;
  }

  return `${prompt.slice(0, maxPromptChars)}

[DevBand note: prompt was trimmed to stay within the configured cost guard limit.]`;
}

function extractJsonFromText(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with extraction below
  }

  const fencedJsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);

  if (fencedJsonMatch?.[1]) {
    try {
      return JSON.parse(fencedJsonMatch[1].trim());
    } catch {
      // Continue with generic extraction below
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const possibleJson = trimmed.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(possibleJson);
    } catch {
      return null;
    }
  }

  return null;
}

function buildSystemPrompt(agentName, fallbackOutput) {
  return `
You are ${agentName} in DevBand, a multi-agent software delivery workflow.

You must return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside JSON.
Do not wrap the response in code fences.

Return JSON matching this exact schema shape:
${JSON.stringify(fallbackOutput, null, 2)}

You may improve the content, but preserve the same top-level keys.
Keep the response concise to control API cost.
`;
}

function buildCacheKey({ agentName, prompt, model }) {
  return `${model}::${agentName}::${prompt}`;
}

async function callAIMLApi({ agentName, prompt, fallbackOutput }) {
  resetDailyCounterIfNeeded();

  const apiKey = process.env.AIML_API_KEY;
  const baseUrl = process.env.AIML_BASE_URL;
  const model = process.env.AIML_MODEL || "gpt-4o-mini";
  const dailyRequestLimit = getNumberEnv("AIML_DAILY_REQUEST_LIMIT", 60);
  const maxOutputTokens = getNumberEnv("AIML_MAX_OUTPUT_TOKENS", 700);

  if (!apiKey) {
    throw new Error("AIML_API_KEY is missing");
  }

  if (!baseUrl) {
    throw new Error("AIML_BASE_URL is missing");
  }

  if (aiUsageState.requestCount >= dailyRequestLimit) {
    throw new Error(
      `AI daily request limit reached: ${aiUsageState.requestCount}/${dailyRequestLimit}`
    );
  }

  const trimmedPrompt = trimPromptIfNeeded(prompt);
  const cacheKey = buildCacheKey({
    agentName,
    prompt: trimmedPrompt,
    model
  });

  if (aiUsageState.cache.has(cacheKey)) {
    return {
      output: aiUsageState.cache.get(cacheKey),
      cacheHit: true
    };
  }

  const url = buildChatCompletionsUrl(baseUrl);

  aiUsageState.requestCount += 1;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: maxOutputTokens,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(agentName, fallbackOutput)
        },
        {
          role: "user",
          content: trimmedPrompt
        }
      ]
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `AI/ML API request failed with status ${response.status}: ${responseText}`
    );
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`AI/ML API returned non-JSON response: ${responseText}`);
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI/ML API response did not contain message content");
  }

  const parsedOutput = extractJsonFromText(content);

  if (!parsedOutput) {
    throw new Error(`Could not parse model output as JSON: ${content}`);
  }

  aiUsageState.cache.set(cacheKey, parsedOutput);

  return {
    output: parsedOutput,
    cacheHit: false
  };
}

async function generateWithModel({ agentName, prompt, fallbackOutput }) {
  const agentMode = process.env.AGENT_MODE || "mock";

  if (agentMode === "mock") {
    return {
      provider: "mock",
      agentName,
      promptUsed: prompt,
      output: fallbackOutput
    };
  }

  if (agentMode === "ai") {
    try {
      const aiResult = await callAIMLApi({
        agentName,
        prompt,
        fallbackOutput
      });

      return {
        provider: aiResult.cacheHit ? "AI/ML API cache" : "AI/ML API",
        agentName,
        promptUsed: prompt,
        output: aiResult.output
      };
    } catch (error) {
      console.error(`[${agentName}] AI provider failed. Using fallback.`, {
        message: error.message
      });

      return {
        provider: "mock_fallback_after_ai_error",
        agentName,
        promptUsed: prompt,
        output: {
          ...fallbackOutput,
          aiProviderError: error.message
        }
      };
    }
  }

  return {
    provider: "mock_fallback_unknown_agent_mode",
    agentName,
    promptUsed: prompt,
    output: fallbackOutput
  };
}

function getAIUsageSummary() {
  resetDailyCounterIfNeeded();

  return {
    date: aiUsageState.date,
    requestCount: aiUsageState.requestCount,
    dailyRequestLimit: getNumberEnv("AIML_DAILY_REQUEST_LIMIT", 60),
    cacheSize: aiUsageState.cache.size,
    model: process.env.AIML_MODEL || "gpt-4o-mini"
  };
}

module.exports = {
  generateWithModel,
  getAIUsageSummary
};