export const COMPANY = {
  name: "Inawol Umbrella Technologies",
  short: "Umbrella Technologies",
  tagline: "AI Agents That Work While You Sleep.",
  subtext:
    "We build intelligent AI agents, automations, websites, mobile applications and AI education programs that transform businesses.",
  email: "hello@umbrellatech.co.zw",
  whatsapp: "+263 78 000 0000",
  location: "Harare, Zimbabwe",
};

export const NAV = [
  { label: "AI Agents", href: "/#service-ai-agents" },
  { label: "Automation", href: "/#service-automation" },
  { label: "Web", href: "/#service-web" },
  { label: "Mobile", href: "/#service-mobile" },
  { label: "AI Training", href: "/#service-training" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export const METRICS = [
  { value: "120+", label: "AI Agents Delivered" },
  { value: "85+", label: "Businesses Automated" },
  { value: "200+", label: "Websites Built" },
  { value: "1,400+", label: "Students Trained" },
];

export const SERVICES = [
  {
    id: "ai-agents",
    title: "AI Agent Development",
    blurb:
      "Autonomous agents that handle support, sales and operations across every channel — chat, WhatsApp and voice.",
    cta: "Build My Agent",
    items: [
      "Customer support agents",
      "WhatsApp agents",
      "Sales agents",
      "HR agents",
      "Lead generation agents",
      "Knowledge assistants",
      "Voice agents",
    ],
  },
  {
    id: "automation",
    title: "Business Automation",
    blurb:
      "Connect your tools and let workflows run themselves — from CRM updates to invoices and follow-ups.",
    cta: "Automate My Business",
    items: [
      "CRM automation",
      "Workflow automation",
      "Document automation",
      "Invoice automation",
      "Email automation",
      "Lead nurturing automation",
    ],
  },
  {
    id: "web",
    title: "Website Development",
    blurb:
      "Fast, modern, conversion-focused web platforms built on the same stack the world's best products use.",
    cta: "Build My Website",
    items: [
      "Corporate websites",
      "E-commerce websites",
      "LMS systems",
      "Booking platforms",
      "Custom web applications",
    ],
  },
  {
    id: "mobile",
    title: "Mobile App Development",
    blurb:
      "Native and cross-platform apps engineered for performance, with enterprise mobility built in.",
    cta: "Build My App",
    items: [
      "Android apps",
      "iOS apps",
      "Flutter apps",
      "Cross-platform applications",
      "Enterprise mobility solutions",
    ],
  },
  {
    id: "training",
    title: "AI Education",
    blurb:
      "Practical AI training that turns teams and classrooms into confident, capable AI builders.",
    cta: "Train My Team",
    items: [
      "Corporate AI training",
      "School AI curriculum",
      "AI workshops",
      "AI certification programs",
      "AI literacy programs",
    ],
  },
];

// Seed projects — these are inserted into Turso on db:init.
// The admin dashboard and /api/projects let you add more with live links + media.
export const SEED_PROJECTS = [
  {
    title: "Sasai Retail Support Agent",
    industry: "Retail",
    description:
      "A 24/7 WhatsApp support agent that resolves order, delivery and returns queries without human handover.",
    technologies: "LangChain, FastAPI, WhatsApp Cloud API, PostgreSQL",
    problem: "Support team overwhelmed by repetitive order-status questions.",
    results: "Response time cut from hours to seconds; 71% of chats fully automated.",
    live_url: "https://example.com/sasai-agent",
    case_study_url: "https://example.com/case/sasai",
    demo_url: "https://example.com/demo/sasai",
    media_type: "image",
    media_url:
      "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80",
    testimonial: "Our customers finally get instant answers, day or night.",
    testimonial_author: "Operations Lead, Sasai Retail",
  },
  {
    title: "ZimHarvest Logistics Automation",
    industry: "Agriculture & Logistics",
    description:
      "End-to-end automation linking orders, dispatch scheduling and invoicing across three systems.",
    technologies: "n8n, FastAPI, Zoho CRM, Google Sheets",
    problem: "Manual data entry between sales, dispatch and accounts caused daily errors.",
    results: "Saved 30+ admin hours per week and eliminated double entry.",
    live_url: "https://example.com/zimharvest",
    case_study_url: "https://example.com/case/zimharvest",
    demo_url: "",
    media_type: "image",
    media_url:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
    testimonial: "It feels like we hired three extra people overnight.",
    testimonial_author: "Founder, ZimHarvest",
  },
  {
    title: "Pamberi Banking Mobile App",
    industry: "Financial Services",
    description:
      "Cross-platform Flutter banking app with biometric login, instant transfers and bill payments.",
    technologies: "Flutter, FastAPI, PostgreSQL, AWS",
    problem: "Legacy app was slow and abandoned by younger customers.",
    results: "App store rating rose from 2.9 to 4.7; daily active users up 3x.",
    live_url: "https://example.com/pamberi-app",
    case_study_url: "https://example.com/case/pamberi",
    demo_url: "https://example.com/demo/pamberi",
    media_type: "video",
    media_url: "",
    testimonial: "The team shipped a flagship product, on time.",
    testimonial_author: "Head of Digital, Pamberi",
  },
  {
    title: "EduSpark AI Curriculum Platform",
    industry: "Education",
    description:
      "An LMS plus AI literacy curriculum rolled out to a network of secondary schools.",
    technologies: "Next.js, FastAPI, OpenAI, PostgreSQL",
    problem: "Schools wanted to teach AI but had no structured, practical program.",
    results: "Trained 600+ students across 8 schools in one term.",
    live_url: "https://example.com/eduspark",
    case_study_url: "https://example.com/case/eduspark",
    demo_url: "",
    media_type: "image",
    media_url:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
    testimonial: "Students are building real AI projects now.",
    testimonial_author: "Curriculum Director, EduSpark",
  },
];
