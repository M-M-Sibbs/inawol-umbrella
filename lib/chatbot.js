// Conversation engine for the lead-capture chatbot.
// Implements the spec algorithm: welcome -> engage -> build curiosity ->
// understand needs -> soft-capture email -> continue value -> capture phone -> convert.
//
// It is deterministic (no external LLM key required to run), but designed so a
// model (Claude / GPT / Gemini) can be dropped in later. The flow keeps the
// tone of "capturing the client's interest" rather than interrogating them.

export const STAGES = [
  "welcome",
  "discover_business",
  "discover_pain",
  "entertain",
  "capture_email",
  "value",
  "capture_phone",
  "convert",
  "done",
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s()-]{6,}\d)/;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Returns { reply, nextStage, captured } given the current stage and user text.
export function nextTurn(stage, userText = "", lead = {}) {
  const text = (userText || "").trim();
  const captured = {};

  switch (stage) {
    case "welcome":
      // First load — no user text yet.
      return {
        reply:
          "Hello 👋 Welcome to Umbrella Technologies. We help businesses use AI to increase revenue, reduce costs and automate the repetitive work. Quick question to get us started — what kind of business are you running?",
        nextStage: "discover_business",
      };

    case "discover_business":
      captured.industry = text.slice(0, 120);
      return {
        reply: pick([
          `Love that — there's a lot AI can do in ${shorten(text)}. What tasks eat up most of your team's time right now?`,
          `Nice. ${capitalize(shorten(text))} is a space where AI tends to pay off fast. If you could automate just one process tomorrow, what would it be?`,
        ]),
        nextStage: "discover_pain",
        captured,
      };

    case "discover_pain":
      captured.pain_points = text.slice(0, 240);
      return {
        reply: pick([
          "Got it. Here's something most teams don't realise: companies spend over 30% of their time on repetitive tasks that AI can handle — quietly, in the background, around the clock.",
          "That's exactly the kind of thing we automate. One of our clients went from replying in hours to replying in seconds — their customers noticed immediately.",
        ]),
        nextStage: "entertain",
        captured,
      };

    case "entertain":
      return {
        reply:
          "AI agents never sleep, never forget and never miss a follow-up. I can put together a short set of recommendations tailored to your business — what email should I send them to?",
        nextStage: "capture_email",
      };

    case "capture_email": {
      const m = text.match(EMAIL_RE);
      if (!m) {
        return {
          reply:
            "No problem — just pop in your best email (like name@company.com) and I'll get those recommendations ready for you.",
          nextStage: "capture_email",
        };
      }
      captured.email = m[0];
      return {
        reply:
          "Perfect, thank you. Based on what you've shared, an AI sales agent or an automation workflow would probably create the biggest impact for you fastest.",
        nextStage: "value",
        captured,
      };
    }

    case "value":
      return {
        reply:
          "If you'd like, one of our specialists can walk you through similar projects we've already delivered. What's the best WhatsApp number to reach you on?",
        nextStage: "capture_phone",
      };

    case "capture_phone": {
      const m = text.match(PHONE_RE);
      if (!m) {
        return {
          reply:
            "Almost there — just drop your WhatsApp number (with country code, e.g. +263…) and we'll line up a quick walkthrough.",
          nextStage: "capture_phone",
        };
      }
      captured.phone = m[0].replace(/\s+/g, " ").trim();
      return {
        reply:
          "Brilliant — you're all set. How would you like to move forward?",
        nextStage: "convert",
        captured,
        options: [
          "Book a discovery call",
          "Request a proposal",
          "Send me case studies",
          "WhatsApp consultation",
        ],
      };
    }

    case "convert":
      captured.desired_solution = text.slice(0, 120);
      return {
        reply:
          "Done — our team has everything they need and will reach out shortly. Thanks for chatting, and welcome aboard. 🚀",
        nextStage: "done",
        captured,
        finished: true,
      };

    default:
      return {
        reply:
          "We've got your details — a specialist will be in touch soon. Anything else I can help with in the meantime?",
        nextStage: "done",
      };
  }
}

// Simple lead score: more complete + budget/intent signals = higher score.
export function scoreLead(lead) {
  let s = 0;
  if (lead.email) s += 30;
  if (lead.phone) s += 30;
  if (lead.industry) s += 10;
  if (lead.pain_points) s += 15;
  if (lead.desired_solution) s += 15;
  return Math.min(s, 100);
}

function shorten(t) {
  const w = (t || "").split(/\s+/).slice(0, 6).join(" ");
  return w || "your industry";
}
function capitalize(t) {
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}
