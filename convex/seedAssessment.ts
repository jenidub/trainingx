import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Seed sample assessment for the General AI Skills domain.
 * Run this from the Convex dashboard after seeding the starter domain.
 */
export const seedStarterAssessment = mutation({
  args: {},
  handler: async (ctx) => {
    // Find the starter domain
    const starterDomain = await ctx.db
      .query("practiceDomains")
      .withIndex("by_slug", (q) => q.eq("slug", "general-ai-skills"))
      .first();

    if (!starterDomain) {
      return {
        success: false,
        error: "Starter domain not found. Seed the domain first.",
      };
    }

    // Check if assessment already exists
    const existingAssessment = await ctx.db
      .query("domainAssessments")
      .withIndex("by_domain", (q) => q.eq("domainId", starterDomain._id))
      .first();

    if (existingAssessment) {
      return {
        success: false,
        error: "Assessment already exists for this domain.",
      };
    }

    // Create the assessment
    const assessmentId = await ctx.db.insert("domainAssessments", {
      domainId: starterDomain._id,
      title: "General AI Skills Mastery Assessment",
      description:
        "Prove your mastery of AI fundamentals with this comprehensive assessment covering prompting, tool selection, and AI safety.",
      timeLimit: 30, // 30 minutes
      passingScore: 70, // 70% to pass
      questionCount: 15,
      maxAttempts: 3,
      cooldownHours: 24,
      status: "live",
    });

    // Sample questions
    const questions = [
      // MCQ Questions (10)
      {
        type: "mcq",
        order: 1,
        scenario:
          "You're a marketing manager preparing a campaign brief. You need to generate 50 product descriptions for an e-commerce site.",
        question:
          "What approach will give you the most consistent results with AI-generated product descriptions?",
        options: [
          {
            id: "a",
            text: "Give the AI freedom to be creative with each description",
            isCorrect: false,
          },
          {
            id: "b",
            text: "Create a template with placeholders and clear instructions for tone, length, and key features",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Generate all 50 at once in a single prompt for efficiency",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Copy a competitor's descriptions and ask AI to rewrite them",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "medium",
        tags: ["prompting", "consistency"],
      },
      {
        type: "mcq",
        order: 2,
        scenario: null,
        question:
          "Which of the following is the MOST important reason to include constraints in your prompts?",
        options: [
          {
            id: "a",
            text: "To make the prompt longer and more detailed",
            isCorrect: false,
          },
          {
            id: "b",
            text: "To guide the AI toward your desired output format and scope",
            isCorrect: true,
          },
          {
            id: "c",
            text: "To confuse the AI into being more creative",
            isCorrect: false,
          },
          {
            id: "d",
            text: "To make the AI work harder on your request",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "easy",
        tags: ["prompting", "constraints"],
      },
      {
        type: "mcq",
        order: 3,
        scenario:
          "Your team is evaluating different AI tools for a project that requires real-time data analysis.",
        question:
          "What is the PRIMARY limitation of most large language models for this use case?",
        options: [
          { id: "a", text: "They cannot understand numbers", isCorrect: false },
          {
            id: "b",
            text: "They have a knowledge cutoff date and cannot access real-time data",
            isCorrect: true,
          },
          {
            id: "c",
            text: "They are too slow for real-time work",
            isCorrect: false,
          },
          { id: "d", text: "They refuse to analyze data", isCorrect: false },
        ],
        points: 100,
        difficulty: "easy",
        tags: ["tool-selection", "limitations"],
      },
      {
        type: "mcq",
        order: 4,
        scenario:
          "You're using AI to help draft a legal contract for a client.",
        question:
          "What is the BEST practice when using AI for legal documents?",
        options: [
          {
            id: "a",
            text: "Use the AI output directly since it's trained on legal data",
            isCorrect: false,
          },
          {
            id: "b",
            text: "Never use AI for legal work under any circumstances",
            isCorrect: false,
          },
          {
            id: "c",
            text: "Use AI as a starting point but have a qualified attorney review and finalize",
            isCorrect: true,
          },
          {
            id: "d",
            text: "Ask the AI to certify the document is legally binding",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "medium",
        tags: ["ai-safety", "professional-use"],
      },
      {
        type: "mcq",
        order: 5,
        scenario: null,
        question:
          "What does 'hallucination' refer to in the context of AI language models?",
        options: [
          {
            id: "a",
            text: "When the AI generates creative fiction",
            isCorrect: false,
          },
          {
            id: "b",
            text: "When the AI confidently generates false or fabricated information",
            isCorrect: true,
          },
          {
            id: "c",
            text: "When the AI refuses to answer a question",
            isCorrect: false,
          },
          { id: "d", text: "When the AI output is too long", isCorrect: false },
        ],
        points: 100,
        difficulty: "easy",
        tags: ["ai-safety", "hallucination"],
      },
      {
        type: "mcq",
        order: 6,
        scenario:
          "You're building a customer support chatbot for your company.",
        question:
          "Which approach is MOST appropriate for handling questions outside the chatbot's training scope?",
        options: [
          {
            id: "a",
            text: "Let the AI attempt to answer everything to seem helpful",
            isCorrect: false,
          },
          {
            id: "b",
            text: "Program explicit boundaries and escalation to human agents",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Ignore out-of-scope questions entirely",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Make up answers to keep users engaged",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "medium",
        tags: ["ai-safety", "boundaries"],
      },
      {
        type: "mcq",
        order: 7,
        scenario: null,
        question: "What is 'prompt injection' in AI security?",
        options: [
          {
            id: "a",
            text: "Adding more details to improve prompt quality",
            isCorrect: false,
          },
          {
            id: "b",
            text: "A technique where malicious instructions are hidden in user input to manipulate AI behavior",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Injecting code into the AI model directly",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Using multiple prompts in sequence",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "hard",
        tags: ["ai-safety", "security"],
      },
      {
        type: "mcq",
        order: 8,
        scenario: "You need to analyze a 200-page PDF report using AI.",
        question: "What is the BEST approach given context window limitations?",
        options: [
          {
            id: "a",
            text: "Paste the entire document at once",
            isCorrect: false,
          },
          {
            id: "b",
            text: "Use RAG (Retrieval-Augmented Generation) or chunking strategies",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Ask the AI to guess the content",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Give up since AI can't handle long documents",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "hard",
        tags: ["tool-selection", "techniques"],
      },
      {
        type: "mcq",
        order: 9,
        scenario: null,
        question: "When is it MOST appropriate to use few-shot prompting?",
        options: [
          {
            id: "a",
            text: "When you want shorter AI responses",
            isCorrect: false,
          },
          {
            id: "b",
            text: "When you need the AI to follow a specific format or style by providing examples",
            isCorrect: true,
          },
          {
            id: "c",
            text: "When the AI is being too creative",
            isCorrect: false,
          },
          {
            id: "d",
            text: "When you're running low on tokens",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "medium",
        tags: ["prompting", "techniques"],
      },
      {
        type: "mcq",
        order: 10,
        scenario:
          "Your company wants to fine-tune an AI model on proprietary customer data.",
        question: "What is the MOST critical consideration before proceeding?",
        options: [
          { id: "a", text: "The cost of fine-tuning", isCorrect: false },
          {
            id: "b",
            text: "Data privacy, consent, and regulatory compliance (GDPR, etc.)",
            isCorrect: true,
          },
          {
            id: "c",
            text: "Which model has the best benchmarks",
            isCorrect: false,
          },
          {
            id: "d",
            text: "How quickly the fine-tuning can be completed",
            isCorrect: false,
          },
        ],
        points: 100,
        difficulty: "hard",
        tags: ["ai-safety", "privacy"],
      },

      // Prompt Writing Questions (5)
      {
        type: "prompt-write",
        order: 11,
        scenario:
          "You're a content strategist at a SaaS startup. Your CEO has asked you to use AI to draft a product announcement email.",
        question:
          "Write a prompt to generate a professional product announcement email.",
        promptGoal:
          "Generate a product announcement email for a new AI-powered analytics dashboard launching next week. The email should be engaging, professional, and include a clear call-to-action.",
        idealAnswer:
          "You are a professional copywriter for a B2B SaaS company. Write a product announcement email for our new AI-powered analytics dashboard launching next week. The email should: 1) Have an attention-grabbing subject line, 2) Be 150-200 words, 3) Highlight 3 key benefits, 4) Include a clear CTA button text, 5) Use a professional but friendly tone. Target audience: existing customers who are data analysts and business managers.",
        promptRubric: {
          criteria: [
            {
              name: "Clarity",
              weight: 25,
              description: "Is the goal clearly stated?",
            },
            {
              name: "Specificity",
              weight: 25,
              description:
                "Are there specific constraints (length, tone, audience)?",
            },
            {
              name: "Structure",
              weight: 25,
              description: "Are requirements well-organized?",
            },
            {
              name: "Context",
              weight: 25,
              description:
                "Is relevant context provided (company, product, audience)?",
            },
          ],
        },
        points: 100,
        difficulty: "medium",
        tags: ["prompting", "writing"],
      },
      {
        type: "prompt-write",
        order: 12,
        scenario: null,
        question:
          "Write a system prompt for a customer support chatbot that handles software subscription inquiries.",
        promptGoal:
          "Create a system prompt that defines the chatbot's persona, capabilities, boundaries, and escalation triggers.",
        idealAnswer:
          "You are SupportBot, a helpful customer support assistant for TechCo's software subscriptions. Your capabilities include: answering billing questions, explaining plan features, processing simple changes (upgrades/downgrades), and providing troubleshooting steps. You should: 1) Always be polite and professional, 2) Ask clarifying questions when needed, 3) Never make up pricing or policy information - say 'Let me check on that' if unsure, 4) Escalate to human agents for: refund requests over $100, account security issues, legal matters, or angry customers. Always protect customer privacy - never share account details in responses.",
        promptRubric: {
          criteria: [
            {
              name: "Persona",
              weight: 20,
              description: "Is the chatbot's identity defined?",
            },
            {
              name: "Capabilities",
              weight: 25,
              description: "Are capabilities clearly listed?",
            },
            {
              name: "Boundaries",
              weight: 30,
              description: "Are limitations and escalation triggers defined?",
            },
            {
              name: "Safety",
              weight: 25,
              description: "Are privacy and security considerations included?",
            },
          ],
        },
        points: 100,
        difficulty: "hard",
        tags: ["prompting", "system-prompts"],
      },
      {
        type: "prompt-write",
        order: 13,
        scenario:
          "You're debugging a complex piece of code and need AI assistance to understand what's happening.",
        question:
          "Write a prompt to get debugging help for a function that's returning unexpected results.",
        promptGoal:
          "Get the AI to analyze code, identify the bug, explain why it's happening, and suggest a fix.",
        idealAnswer:
          "I have a JavaScript function that should filter active users from an array, but it's returning an empty array even when there are active users. Here's the code: [code]. Expected behavior: Return users where isActive === true. Actual behavior: Returns []. Can you: 1) Identify the bug, 2) Explain why this is happening, 3) Provide the corrected code, 4) Suggest any best practices I'm missing?",
        promptRubric: {
          criteria: [
            {
              name: "Problem Statement",
              weight: 30,
              description: "Is the issue clearly described?",
            },
            {
              name: "Context",
              weight: 25,
              description: "Is relevant code/context provided?",
            },
            {
              name: "Expected vs Actual",
              weight: 25,
              description: "Are expected and actual behaviors specified?",
            },
            {
              name: "Specific Ask",
              weight: 20,
              description: "Are specific questions/requests made?",
            },
          ],
        },
        points: 100,
        difficulty: "medium",
        tags: ["prompting", "debugging"],
      },
      {
        type: "image-prompt",
        order: 14,
        scenario:
          "You're creating marketing materials for a new eco-friendly water bottle brand.",
        question:
          "Write an image generation prompt for a product photo of the water bottle.",
        promptGoal:
          "Generate a professional product photography image suitable for e-commerce or marketing use.",
        idealAnswer:
          "Professional product photography of a sleek, minimalist stainless steel water bottle in forest green color, placed on a natural wooden surface with soft morning light coming from the left side. Background shows blurred greenery suggesting outdoor/nature theme. The bottle should be the clear focal point, photographed at a slight 3/4 angle. Style: Clean, modern, high-end commercial photography. Lighting: Soft natural light with gentle shadows. Resolution: 4K, sharp focus on the product.",
        promptRubric: {
          criteria: [
            {
              name: "Subject Description",
              weight: 25,
              description: "Is the product clearly described?",
            },
            {
              name: "Composition",
              weight: 25,
              description: "Are angle, positioning, and framing specified?",
            },
            {
              name: "Lighting & Style",
              weight: 25,
              description: "Are lighting and visual style defined?",
            },
            {
              name: "Context & Background",
              weight: 25,
              description: "Is the setting/background described?",
            },
          ],
        },
        points: 100,
        difficulty: "medium",
        tags: ["prompting", "image-generation"],
      },
      {
        type: "prompt-fix",
        order: 15,
        scenario:
          "A colleague wrote this prompt for generating meeting notes, but it's producing inconsistent results.",
        question:
          "Improve this prompt to get better, more consistent meeting notes:\n\n'Summarize this meeting.'",
        promptGoal:
          "Rewrite the vague prompt to be specific, actionable, and produce consistent meeting summary output.",
        idealAnswer:
          "You are a professional executive assistant. Summarize the following meeting transcript into structured notes with these sections: 1) Meeting Title and Date, 2) Attendees, 3) Key Discussion Points (3-5 bullet points), 4) Decisions Made (list each decision), 5) Action Items (format: [Who] will [do what] by [when]), 6) Next Steps. Use professional language, be concise, and highlight any unresolved issues. Maximum 400 words.",
        promptRubric: {
          criteria: [
            {
              name: "Structure",
              weight: 30,
              description: "Does the improved prompt define output structure?",
            },
            {
              name: "Specificity",
              weight: 25,
              description: "Are specific requirements added?",
            },
            {
              name: "Constraints",
              weight: 25,
              description: "Are formatting and length constraints included?",
            },
            {
              name: "Role",
              weight: 20,
              description: "Is context or role provided?",
            },
          ],
        },
        points: 100,
        difficulty: "medium",
        tags: ["prompting", "improvement"],
      },
    ];

    // Insert all questions
    for (const q of questions) {
      await ctx.db.insert("domainAssessmentQuestions", {
        assessmentId,
        type: q.type,
        order: q.order,
        scenario: q.scenario || undefined,
        question: q.question,
        options: q.options || undefined,
        promptGoal: q.promptGoal || undefined,
        promptRubric: q.promptRubric || undefined,
        idealAnswer: q.idealAnswer || undefined,
        points: q.points,
        difficulty: q.difficulty,
        tags: q.tags,
        status: "live",
      });
    }

    return {
      success: true,
      assessmentId,
      questionsCreated: questions.length,
    };
  },
});
