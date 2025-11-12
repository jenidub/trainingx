import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * AI Evaluation Service
 * Replaces alert() placeholders with real AI-powered prompt evaluation
 * Supports OpenAI and Anthropic with retry logic and cost tracking
 */

interface EvaluationResult {
  rubricScores: {
    clarity: number;
    constraints: number;
    iteration: number;
    tool: number;
  };
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

interface ProviderConfig {
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
}

// Get provider configuration from environment
function getProviderConfig(): ProviderConfig {
  const provider = (process.env.AI_EVAL_PROVIDER || "openai") as "openai" | "anthropic";
  const model = provider === "openai" 
    ? (process.env.OPENAI_MODEL || "gpt-4o-mini")
    : (process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022");
  
  const apiKey = provider === "openai"
    ? process.env.OPENAI_API_KEY!
    : process.env.ANTHROPIC_API_KEY!;

  if (!apiKey) {
    throw new Error(`Missing API key for ${provider}`);
  }

  return { provider, model, apiKey };
}

// Evaluate a prompt draft using AI
export const evaluatePromptDraft = action({
  args: {
    attemptId: v.id("practiceAttempts"),
    userPrompt: v.string(),
    context: v.object({
      scenario: v.string(),
      goal: v.string(),
      constraints: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args): Promise<EvaluationResult> => {
    const config = getProviderConfig();
    const startTime = Date.now();

    try {
      const result = await evaluateWithRetry(config, args.userPrompt, args.context);
      const latencyMs = Date.now() - startTime;

      // Log the evaluation
      await ctx.runMutation(internal.aiEvaluation.logEvaluation, {
        attemptId: args.attemptId,
        provider: config.provider,
        model: config.model,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        cost: calculateCost(config, result.usage),
        latencyMs,
        success: true,
      });

      return result.evaluation;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      await ctx.runMutation(internal.aiEvaluation.logEvaluation, {
        attemptId: args.attemptId,
        provider: config.provider,
        model: config.model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
});

// Retry logic wrapper
async function evaluateWithRetry(
  config: ProviderConfig,
  userPrompt: string,
  context: any,
  maxRetries = 3
): Promise<{ evaluation: EvaluationResult; usage: any }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (config.provider === "openai") {
        return await evaluateWithOpenAI(config, userPrompt, context);
      } else {
        return await evaluateWithAnthropic(config, userPrompt, context);
      }
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error("Evaluation failed after retries");
}

// OpenAI evaluation
async function evaluateWithOpenAI(
  config: ProviderConfig,
  userPrompt: string,
  context: any
): Promise<{ evaluation: EvaluationResult; usage: any }> {
  const systemPrompt = buildEvaluationPrompt(context);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const evaluation = JSON.parse(data.choices[0].message.content);

  return {
    evaluation: normalizeEvaluation(evaluation),
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

// Anthropic evaluation
async function evaluateWithAnthropic(
  config: ProviderConfig,
  userPrompt: string,
  context: any
): Promise<{ evaluation: EvaluationResult; usage: any }> {
  const systemPrompt = buildEvaluationPrompt(context);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Extract JSON from response (Anthropic doesn't have structured output yet)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON from Anthropic response");
  }
  
  const evaluation = JSON.parse(jsonMatch[0]);

  return {
    evaluation: normalizeEvaluation(evaluation),
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  };
}

// Build evaluation prompt
function buildEvaluationPrompt(context: any): string {
  return `You are an expert AI prompt evaluator. Evaluate the user's prompt based on these criteria:

**Scenario Context:**
${context.scenario}

**Goal:** ${context.goal}

${context.constraints ? `**Constraints:** ${context.constraints.join(", ")}` : ""}

**Evaluation Rubric (0-100 each):**

1. **Clarity (0-100)**: Is the prompt clear, specific, and unambiguous?
   - 90-100: Crystal clear with specific details
   - 70-89: Clear but could be more specific
   - 50-69: Somewhat vague or ambiguous
   - 0-49: Unclear or confusing

2. **Constraints (0-100)**: Does it properly handle requirements and limitations?
   - 90-100: All constraints explicitly addressed
   - 70-89: Most constraints covered
   - 50-69: Some constraints missing
   - 0-49: Ignores key constraints

3. **Iteration (0-100)**: Does it guide the AI toward refinement?
   - 90-100: Includes feedback loops and refinement steps
   - 70-89: Some iteration guidance
   - 50-69: Minimal iteration support
   - 0-49: No iteration guidance

4. **Tool (0-100)**: Does it leverage AI capabilities effectively?
   - 90-100: Optimal use of AI strengths
   - 70-89: Good use of AI capabilities
   - 50-69: Basic AI usage
   - 0-49: Doesn't leverage AI well

**Response Format (JSON):**
{
  "rubricScores": {
    "clarity": <number 0-100>,
    "constraints": <number 0-100>,
    "iteration": <number 0-100>,
    "tool": <number 0-100>
  },
  "overallScore": <number 0-100>,
  "feedback": "<2-3 sentence summary>",
  "suggestions": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`;
}

// Normalize evaluation result
function normalizeEvaluation(raw: any): EvaluationResult {
  return {
    rubricScores: {
      clarity: Math.min(100, Math.max(0, raw.rubricScores?.clarity || 0)),
      constraints: Math.min(100, Math.max(0, raw.rubricScores?.constraints || 0)),
      iteration: Math.min(100, Math.max(0, raw.rubricScores?.iteration || 0)),
      tool: Math.min(100, Math.max(0, raw.rubricScores?.tool || 0)),
    },
    overallScore: Math.min(100, Math.max(0, raw.overallScore || 0)),
    feedback: raw.feedback || "No feedback provided",
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.slice(0, 5) : [],
  };
}

// Calculate cost based on provider and usage
function calculateCost(config: ProviderConfig, usage: any): number {
  if (config.provider === "openai") {
    // GPT-4o-mini pricing (as of 2024)
    const inputCost = (usage.promptTokens / 1_000_000) * 0.15;
    const outputCost = (usage.completionTokens / 1_000_000) * 0.60;
    return inputCost + outputCost;
  } else {
    // Claude 3.5 Sonnet pricing
    const inputCost = (usage.promptTokens / 1_000_000) * 3.00;
    const outputCost = (usage.completionTokens / 1_000_000) * 15.00;
    return inputCost + outputCost;
  }
}

// Internal mutation to log evaluation
export const logEvaluation = internalMutation({
  args: {
    attemptId: v.id("practiceAttempts"),
    provider: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
    latencyMs: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiEvaluationLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
