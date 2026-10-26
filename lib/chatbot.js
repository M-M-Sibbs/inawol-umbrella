// Server-side lead-capture conversation engine.
// Implements the staged algorithm: welcome -> engage -> build curiosity ->
// understand needs -> capture email -> value -> capture phone -> convert.
// If an LLM key is present it generates the "entertain/engage" replies in
// Umbrella's voice; otherwise it falls back to a fully scripted flow.

export const STAGES = [
  "welcome",
  "discover",
  "entertain",
  "capture_email",
  "value",
  "capture_phone",
  "convert",
  "done",
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;

export function extractEmail(text = "") {
  const m = text.match(EMAIL_RE);
  return m ? m[0] : null;
}
export function extractPhone(text = "") {
  const m = text.match(PHONE_RE);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}

// Lightweight intent / interest detection for lead scoring.
export function scoreLead(lead) {
  let s = 0;
  if (lead.email) s += 30;
  if (lead.phone) s += 30;
  if (lead.company) s += 10;
  if (lead.pain_points) s += 15;
  if (lead.desired_solution) s += 15;
  return Math.min(100, s);
}

const SCRIPT = {
  welcome:
    "Hello 👋 Welcome to Umbrella Technologies. We build AI agents, business automation, websites, mobile apps and run AI training — whatever helps your business grow. What kind of business are you running, and what are you hoping to achieve?",
  discover: [
    "Nice — that's a space where the right solution pays off fast. What's the biggest challenge or opportunity you're facing right now?",
    "Got it. Which would move the needle most for you — AI agents, automation, a new website or app, or AI training for your team?",
    "Makes sense. Roughly how big is your team, and what's your timeline for getting this done?",
  ],
  entertain: [
    "Here's what most businesses miss: whether it's an AI agent handling customers 24/7, automation removing manual work, or a sharp website bringing in leads, these projects usually pay for themselves fast. One client cut response times from hours to seconds; another doubled online enquiries after a rebuild.",
    "Whatever you need — agents, automation, web, mobile or training — we deliver it end to end and support it after launch. You get one team for the whole journey.",
  ],
  capture_email:
    "I'd love to put together a tailored recommendation and a rough quote for your project. What's the best email to send it to?",
  value:
    "Perfect — based on what you've shared, we can absolutely help with this. Our team will map out exactly how we'd approach it and what it would take to deliver.",
  capture_phone:
    "To move this forward quickly, one of our specialists can walk you through similar projects and answer any questions. What's the best WhatsApp number to reach you on?",
  convert:
    "You're all set 🎉 A specialist will reach out shortly to take this forward. Want to book a discovery call now, request a full proposal, or get our case studies while you wait?",
  done:
    "Thanks! We've got your details and a specialist will be in touch very soon to get your project moving. Feel free to keep exploring our work in the meantime.",
};

// Decide the next stage from the current stage + accumulated lead data.
export function nextStage(stage, lead, turnsInStage) {
  switch (stage) {
    case "welcome":
      return "discover";
    case "discover":
      // spend ~2 turns discovering before entertaining
      return turnsInStage >= 2 ? "entertain" : "discover";
    case "entertain":
      return turnsInStage >= 1 ? "capture_email" : "entertain";
    case "capture_email":
      return lead.email ? "value" : "capture_email";
    case "value":
      return "capture_phone";
    case "capture_phone":
      return lead.phone ? "convert" : "capture_phone";
    case "convert":
      return "done";
    default:
      return "done";
  }
}

// Build the scripted assistant reply for a stage.
export function scriptedReply(stage, lead, turnsInStage) {
  const pick = (arr, i) => arr[Math.min(i, arr.length - 1)];
  switch (stage) {
    case "welcome":
      return SCRIPT.welcome;
    case "discover":
      return pick(SCRIPT.discover, turnsInStage);
    case "entertain":
      return pick(SCRIPT.entertain, turnsInStage);
    case "capture_email":
      return lead.email
        ? SCRIPT.value
        : SCRIPT.capture_email;
    case "value":
      return SCRIPT.value;
    case "capture_phone":
      return lead.phone ? SCRIPT.convert : SCRIPT.capture_phone;
    case "convert":
      return SCRIPT.convert;
    default:
      return SCRIPT.done;
  }
}

// System prompt for the LLM layer — keeps the model on-script and persuasive
// without being pushy, in Umbrella's voice.
export function systemPrompt(stage, lead) {
  return `You are the sales assistant for ${"Inawol Umbrella Technologies"}, a technology company in Zimbabwe that delivers five things: AI agents, business automation, website development, mobile app development, and AI training. You serve clients in Zimbabwe, Southern Africa and worldwide.

Your job is to have a warm, curious, genuinely helpful conversation that turns a website visitor into a qualified, booked sales lead. Sound human and consultative, never pushy or robotic. Keep replies to 1-3 short sentences. Use at most one emoji occasionally.

SERVICE HANDLING — IMPORTANT:
- Treat ALL FIVE services equally. AI agents, automation, websites, mobile apps and AI training are all core offerings — never favour one over another. Match the recommendation to what the visitor actually wants, not to a preset preference.
- Whatever service the visitor is interested in — including business automation — you ALWAYS move to capture their details and hand them to a human. Never decline, deflect, or tell a visitor a service isn't available. Every enquiry becomes a captured lead.
- If a visitor is unsure what they need, briefly help them see which of the five fits best, then proceed to capture their details.

You are guided by a staged flow. The CURRENT STAGE is: "${stage}".
Stage meanings:
- welcome: greet, say in one line that Umbrella builds AI agents, automation, websites, mobile apps and AI training, and ask what business they run and what they want to achieve.
- discover: ask one sharp question to understand their goal and which service fits (their main challenge, which service interests them, team size, timeline). One question per message.
- entertain: share one credible insight or short success story relevant to THEIR stated interest, to build confidence. Do not ask for contact info yet.
- capture_email: offer to send a tailored recommendation and a rough quote, and ask for their email. Only ask for email here.
- value: confirm you can deliver what they need and that your team will map out the approach. Be encouraging and specific to their service. Do not ask for contact info.
- capture_phone: offer a specialist walkthrough to move things forward and ask for their best WhatsApp number. Only ask for phone here.
- convert: confirm they're set and CLOSE — offer a clear next step: book a discovery call, request a full proposal, or get case studies. Create gentle urgency to act now.
- done: thank them warmly and tell them a specialist will be in touch soon to get their project moving.

Known lead data so far: ${JSON.stringify(lead)}.

Rules:
- Never invent the visitor's details. Only ask for ONE piece of contact info at the designated stage.
- Stay on the current stage's goal. Do not skip ahead to asking for contact details early.
- Always be moving toward the close: a booked call, a proposal, or captured contact details.
- Be specific to what the visitor said and to the service they care about.
Return ONLY the assistant's next message, nothing else.`;
}
