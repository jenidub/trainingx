export type PromptArenaCard = {
  id: string;
  title: string;
  mission: string;
  goal: string;
  type: string;
  skills: string[];
  cues: string[];
  prompt: string;
  applyPreview: string;
  reward: string;
  skillBoost: string;
};

export const promptArenaDeck: PromptArenaCard[] = [
  {
    id: "brand-rescue",
    title: "Brand Rescue Blitz",
    mission:
      "Community is filled with angry posts about a sudden price increase. You are the calm ops strategist who has to respond.",
    goal:
      "Draft a 150-word reply that keeps momentum positive without promising discounts.",
    type: "Crisis Comms",
    skills: ["Empathetic Framing", "Tone Tuning", "Next-Step Coaching"],
    cues: [
      "Start with a mirror of the community emotion.",
      "Explain the business logic in one crisp analogy.",
      "Close with two concrete actions users can take.",
    ],
    prompt: `You are the head of community at a fast-growing AI platform. Users are upset about a sudden price increase. Draft a reply that validates their concerns, explains why the change happened, and gives them two next steps to stay engaged without offering a discount.`,
    applyPreview:
      "Hey builders, you're right to call out the sticker shock — it caught us too. The new rate fuels the GPU co-op that keeps models fast for everyone, similar to how solar homes buy back energy for the grid. This week we opened an insight vault with real usage benchmarks plus a fast-track to our beta partner program. Jump in there, show us what you’re shipping, and we’ll feature your builds in the next town hall.",
    reward: "+40 community trust • +1 Calm Under Fire badge fragment",
    skillBoost: "Empathy before logic, analogy-driven clarity, action-oriented close",
  },
  {
    id: "vision-synth",
    title: "Vision Synth Gauntlet",
    mission:
      "A founder fed 4 investor memos and wants a single provocative POV for the next board sync.",
    goal:
      "Fuse the memos into one spicy narrative arc that ends with a moonshot experiment.",
    type: "Product Strategy",
    skills: ["Synthesis", "Narrative Arcs", "Bold Bets"],
    cues: [
      "Use a three-act structure (setup, tension, leap).",
      "Surface one surprising data point as a 'glitch in the matrix'.",
      "Pitch a named experiment with a scorecard.",
    ],
    prompt: `Combine four investor memos about the company's AI roadmap into a single narrative with a strong point of view. Use a three-act structure (setup, tension, leap), highlight one unexpected data point, and close with a bold experiment the board can rally behind.`,
    applyPreview:
      "Act I — The Merge Lane: Every memo agrees the agent marketplace is swelling faster than planned. Act II — The Glitch: 37% of paying teams hack their own evaluation stack because ours stops at sandbox demos. Act III — The Leap: Launch Operation Lighthouse, a 30-day duel format where customers pit their agent vs. ours using the same rubric. Score on win rate, cost per action, and delight. If we ship the scoreboard, we own the standard.",
    reward: "+30 strategy XP • +1 Bold Bets charge",
    skillBoost: "Story beats + insight nugget + experiment framing",
  },
  {
    id: "workflow-lab",
    title: "Workflow Refactor Lab",
    mission:
      "Ops lead wants to replace a clunky handoff between SDRs and AEs with an agent loop.",
    goal:
      "Design the loop, highlight two failure states, and script the escalation prompt.",
    type: "Systems Design",
    skills: ["Loop Design", "Edge Case Anticipation", "Prompt Chaining"],
    cues: [
      "Diagram the loop in text (Step ➜ Step).",
      "Name two red flags and how the agent detects them.",
      "Write the exact escalation prompt for the AE.",
    ],
    prompt: `Outline an AI-assisted workflow that hands qualified leads from SDRs to AEs. Describe the loop in steps, call out two failure states the agent should watch for, and provide the escalation prompt that pings an AE when human review is needed.`,
    applyPreview:
      "Loop: Intake ➜ Qualification ➜ Context Pack ➜ AE Nudge ➜ Feedback Sync. The agent flags Lead Drift when intent keywords fade below 0.4 confidence and Data Fog when enrichment sources disagree on firm size. Escalation prompt: “Hey <AE>, SDR Loop found a Pro tier lead with intent score 0.72 but data fog on employee count. Send a two-line validation plus one assumption to unblock pricing?”",
    reward: "+35 systems XP • Loop Architect shard collected",
    skillBoost: "Structured loop writing with guardrails + escalation scripting",
  },
  {
    id: "recruit-triage",
    title: "Recruit Triage Arena",
    mission:
      "Recruiting squad needs a lightning-fast rubric to score async video pitches.",
    goal:
      "Produce a mini scorecard, emoji-based feedback language, and an automated follow-up prompt.",
    type: "Talent Ops",
    skills: ["Rubric Crafting", "Signal Naming", "Follow-up Sequencing"],
    cues: [
      "Score on three creative traits 0-3.",
      "Translate the score into an emoji-coded response.",
      "Draft the automated follow-up DM script.",
    ],
    prompt: `Design a rubric to evaluate async video introductions for a recruiting challenge. Include three traits scored 0-3, show how to translate the total into an emoji-coded response, and provide the follow-up DM the agent should send.`,
    applyPreview:
      "Rubric: Spark (story energy), Stack (tool fluency), Scrappiness (bias for shipping). Emoji dial: 0-2 💤, 3-5 ⚡, 6-9 🚀. Follow-up DM: “🚀 Alert! Your intro screamed builder energy. We’re lining up a rapid-fire duo challenge — expect a calendar hold plus prep kit in 4 hours.”",
    reward: "+28 talent XP • +1 Playful Feedback token",
    skillBoost: "Micro-rubric + playful comms translation",
  },
  {
    id: "playbook-remix",
    title: "Customer Playbook Remix",
    mission:
      "Sales enablement wants a 1-page beat sheet reps can use to remix AI success stories on the fly.",
    goal:
      "Create a remix template, spotlight one objection handling combo, and attach a hype line.",
    type: "Enablement",
    skills: ["Templating", "Objection Mapping", "Copy Spark"],
    cues: [
      "Template needs Hook ➜ Build ➜ Win proof.",
      "Name an objection combo move.",
      "End with a hype line reps can read verbatim.",
    ],
    prompt: `Build a remix-friendly template reps can use to tell AI customer stories. Follow Hook ➜ Build ➜ Win, add one objection handling combo, and finish with a short hype line.`,
    applyPreview:
      "Hook: “Team Nova cut onboarding to 12 minutes.” Build: Problem, Agent move, Unexpected assist. Win: Metric, customer quote, unlock. Objection combo: Latency Freakout ➜ “Drop in Ghost Mode recording to prove response under 1.2s, then swap to cost-per-action chart.” Hype line: “Want your inbox to flex like Nova’s? Spin up Ghost Mode and race us.”",
    reward: "+24 enablement XP • Story Remix badge progress",
    skillBoost: "Reusable storytelling scaffolds + objection combo naming",
  },
  {
    id: "insight-boss",
    title: "Insight Boss Fight",
    mission:
      "The CEO needs an arena-style readout turning raw usage logs into a hype reel for investors.",
    goal:
      "Surface two cinematic stats, translate them into human impact, and script the arena commentary.",
    type: "Data Storytelling",
    skills: ["Insight Mining", "Metaphor Design", "Live Commentary"],
    cues: [
      "Pick two stats and give them arena nicknames.",
      "Translate raw numbers into a sensory moment.",
      "Write a commentator line that makes investors grin.",
    ],
    prompt: `Transform raw platform usage logs into a hype reel for investors. Select two stats, nickname them, translate the numbers into human impact, and write the commentary line.`,
    applyPreview:
      "Stat 1: “Midnight Multiplier” — 41% of builds now ship between 11pm-3am. Stat 2: “Loop Loyalty” — average agent rerun per brief hit 7.4. Commentary: “Investors, the Midnight Multiplier crowd is literally bending time, while Loop Loyalty proves they treat TrainingX like a sparring partner they can’t quit.”",
    reward: "+32 storytelling XP • Commentary booster unlocked",
    skillBoost: "Stat naming + sensory translation + color commentary",
  },
];
