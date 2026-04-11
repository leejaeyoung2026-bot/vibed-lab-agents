import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Code Agents — vibed-lab",
  description:
    "Curated weekly directory of Claude Code agents. Discover trending and hand-picked agents to supercharge your workflow.",
  metadataBase: new URL("https://agents.vibed-lab.com"),
  openGraph: {
    title: "Claude Code Agents — vibed-lab",
    description: "Curated weekly directory of Claude Code agents.",
    url: "https://agents.vibed-lab.com",
    siteName: "vibed-lab agents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            <strong>vibed-lab</strong> / agents
          </a>
          <nav>
            <a href="https://vibed-lab.com">← vibed-lab.com</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Curated weekly · Data from{" "}
            <a href="https://github.com/leejaeyoung2026-bot/vibed-lab-agents">
              GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
