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
          "Hello 👋 Welcome to Umbrella Technologies. We build AI agents, business automation, websites, mobile apps and run AI training — whatever helps your business grow. To get us started, what kind of business are you running, and what are you hoping to achieve?",
        nextStage: "discover_business",
      };

    case "discover_business":
      captured.industry = text.slice(0, 120);
      return {
        reply: pick([
          `Love that — there's a lot we can do for a business in ${shorten(text)}. Which would help you most right now: an AI agent, automation, a new website or app, or AI training for your team?`,
          `Nice. ${capitalize(shorten(text))} is a space where the right solution pays off fast. What's the biggest challenge or goal you'd want us to help with first?`,
        ]),
        nextStage: "discover_pain",
        captured,
      };

    case "discover_pain":
      captured.pain_points = text.slice(0, 240);
      return {
        reply: pick([
          "Got it — that's exactly the kind of thing we deliver, end to end. Whether it's an AI agent, an automation, a website, a mobile app or training your team, we handle the whole project and support it after launch.",
          "Perfect, we can definitely help with that. One client cut response times from hours to seconds with an agent; another doubled their online enquiries after a website rebuild — it depends on what fits you best.",
        ]),
        nextStage: "entertain",
        captured,
      };

    case "entertain":
      return {
        reply:
          "Here's the good part: whatever you need — agents, automation, web, mobile or training — you get one team for the whole journey. I'd love to put together a tailored recommendation and a rough quote for you — what's the best email to send it to?",
        nextStage: "capture_email",
      };

    case "capture_email": {
      const m = text.match(EMAIL_RE);
      if (!m) {
        return {
          reply:
            "No problem — just pop in your best email (like name@company.com) and I'll get your recommendation and quote ready for you.",
          nextStage: "capture_email",
        };
      }
      captured.email = m[0];
      return {
        reply:
          "Perfect, thank you. Based on what you've shared, we can absolutely deliver this — our team will map out exactly how we'd approach it and what it would take.",
        nextStage: "value",
        captured,
      };
    }

    case "value":
      return {
        reply:
          "To move this forward quickly, one of our specialists can walk you through similar projects we've already delivered and answer any questions. What's the best WhatsApp number to reach you on?",
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
          "Brilliant — you're all set 🎉 Let's lock in the next step. How would you like to move forward?",
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
          "Done — our team has everything they need and will reach out shortly to get your project moving. Thanks for chatting, and welcome aboard. 🚀",
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
