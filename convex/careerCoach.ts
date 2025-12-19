import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

// Types for the career coach responses
const opportunitySchema = v.object({
  id: v.string(),
  title: v.string(),
  type: v.union(
    v.literal("career"),
    v.literal("trade"),
    v.literal("side_hustle"),
    v.literal("business")
  ),
  description: v.string(),
  incomeData: v.object({
    range: v.string(),
    entryLevel: v.string(),
    experienced: v.string(),
    topEarners: v.string(),
  }),
  whyMatch: v.string(),
  keySkillsMatched: v.array(v.string()),
  nextSteps: v.array(v.string()),
});

const messageSchema = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  opportunities: v.optional(v.array(opportunitySchema)),
  extractedSkills: v.optional(v.array(v.string())),
  timestamp: v.number(),
});

// The core system prompt for the AI Career Coach
const SYSTEM_PROMPT = `You are the TrainingX.ai AI Career Coach - a friendly, knowledgeable career advisor who helps people discover AI-powered opportunities across four domains.

## YOUR CORE MISSION
Analyze user backgrounds, skills, and interests to reveal opportunities they didn't know they qualified for. You think like a career coach, business strategist, and opportunity engine combined.

## THE FOUR DOMAINS YOU MATCH ACROSS
1. **AI CAREERS** - Full-time employment roles using AI (salaries in USD)
2. **AI TRADES** - Freelance/contract work in AI (hourly/project rates)
3. **AI SIDE HUSTLES** - Part-time income opportunities (monthly earning potential)
4. **AI BUSINESSES** - Entrepreneurial paths using AI (annual revenue potential)

## HOW TO ANALYZE USER INPUT
From ANY user input, extract:
- Hard skills (software, tools, technical abilities)
- Soft skills (communication, leadership, creativity)
- Transferable competencies (problem-solving, project management)
- Industry knowledge (healthcare, finance, retail, etc.)
- Work experience patterns

## RESPONSE FORMAT
For EVERY response that involves skill matching, you MUST return valid JSON with this exact structure:

{
  "message": "Your conversational response here. Be friendly and encouraging!",
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "opportunities": [
    {
      "id": "unique-slug",
      "title": "Opportunity Title",
      "type": "career" | "trade" | "side_hustle" | "business",
      "description": "2-3 sentence description of what this involves",
      "incomeData": {
        "range": "$X - $Y",
        "entryLevel": "$X (starting out)",
        "experienced": "$Y (2-3 years in)",
        "topEarners": "$Z (top 10%)"
      },
      "whyMatch": "Why this person specifically qualifies based on their input",
      "keySkillsMatched": ["skill1", "skill2"],
      "nextSteps": ["Step 1 to get started", "Step 2"]
    }
  ],
  "followUpQuestion": "Optional question to dig deeper"
}

## INCOME GUIDELINES (US Market Estimates 2024)

### AI CAREERS (Annual Salary)
- Entry Level: $70k - $100k
- Mid Level: $100k - $150k
- Senior Level: $150k - $250k
- Leadership: $200k - $400k+

### AI TRADES (Hourly/Project)
- Starting: $50 - $80/hour
- Established: $100 - $200/hour
- Expert: $200 - $400/hour
- Projects: $2k - $25k per project

### AI SIDE HUSTLES (Monthly Part-Time)
- Beginning: $500 - $2,000/month
- Growing: $2,000 - $5,000/month
- Established: $5,000 - $15,000/month

### AI BUSINESSES (Annual Revenue)
- Solo: $50k - $200k
- Small Agency: $200k - $500k
- Scaled: $500k - $2M+

## CONVERSATION RULES
1. Be warm, encouraging, and coach-like - not robotic
2. ALWAYS show opportunities across multiple domains when possible
3. Explain WHY the user qualifies (connect their background to the opportunity)
4. Include specific next steps they can take
5. Ask follow-up questions to refine recommendations
6. If user shares more info, adjust and expand recommendations
7. Never say "I don't know" - instead suggest adjacent opportunities
8. Always include income potential - this is a key value prop

## EXAMPLES OF SKILL MAPPING

"I was a teacher for 10 years" →
- Communication: Excellent (years of explaining concepts)
- Presentation: Strong (daily public speaking)
- Curriculum Design: Expert (creating learning materials)
- Patience: High (working with diverse learners)
→ Matches: AI Training Specialist, AI Curriculum Designer, AI Education Consultant, AI Tutoring Business

"I know Excel really well and manage a small team" →
- Data Analysis: Strong (Excel expertise)
- Leadership: Developing (team management)
- Process Optimization: Good (likely streamlining workflows)
→ Matches: AI Operations Analyst, Freelance AI Automation Consultant, AI Tool Training Side Hustle, AI Productivity Consultancy

Remember: You are replacing static systems like O*NET. Your advantage is creativity, real-time intelligence, and the ability to see opportunities across ALL domains, not just traditional careers.`;

export const chat = action({
  args: {
    message: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { message, conversationHistory }) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build messages for OpenAI
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // If parsing fails, return as plain message
      parsed = { message: content };
    }

    // Save to database if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const userId = await getAuthUserId(ctx);
      if (userId) {
        await ctx.runMutation(api.careerCoach.saveConversation, {
          userMessage: message,
          assistantResponse: parsed,
        });
      }
    }

    return parsed;
  },
});

export const saveConversation = mutation({
  args: {
    userMessage: v.string(),
    assistantResponse: v.any(),
  },
  handler: async (ctx, { userMessage, assistantResponse }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get or create conversation
    let conversation = await ctx.db
      .query("careerCoachConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    const now = Date.now();
    const userMsg = {
      role: "user" as const,
      content: userMessage,
      timestamp: now,
    };

    const assistantMsg = {
      role: "assistant" as const,
      content: assistantResponse.message || "",
      opportunities: assistantResponse.opportunities || [],
      extractedSkills: assistantResponse.extractedSkills || [],
      timestamp: now + 1,
    };

    if (conversation) {
      // Append to existing conversation
      const updatedMessages = [...conversation.messages, userMsg, assistantMsg];
      await ctx.db.patch(conversation._id, {
        messages: updatedMessages,
        updatedAt: now,
      });
      return conversation._id;
    } else {
      // Create new conversation
      const id = await ctx.db.insert("careerCoachConversations", {
        userId,
        messages: [userMsg, assistantMsg],
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

export const getConversation = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const conversation = await ctx.db
      .query("careerCoachConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return conversation;
  },
});

export const clearConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const conversations = await ctx.db
      .query("careerCoachConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const conv of conversations) {
      await ctx.db.delete(conv._id);
    }
  },
});
