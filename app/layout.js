import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import { COMPANY } from "../lib/content";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "Inawol Umbrella Technologies — AI Agents, Automation & Digital Products",
  description:
    "Umbrella Technologies builds AI agents, intelligent automations and digital products that help organizations operate faster, smarter and more profitably. AI Agent Development, Automation, Web & Mobile Development and AI Training in Zimbabwe.",
  keywords: [
    "AI Agent Development Zimbabwe",
    "AI Automation Zimbabwe",
    "Website Development Zimbabwe",
    "Mobile App Development Zimbabwe",
    "AI Training Zimbabwe",
    "AI Consulting Zimbabwe",
  ],
  openGraph: {
    title: "Inawol Umbrella Technologies",
    description: COMPANY.subtext,
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-space text-[#E8ECF6]">{children}</body>
    </html>
  );
}
