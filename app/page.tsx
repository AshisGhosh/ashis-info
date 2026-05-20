import { Github, Linkedin, Newspaper } from "lucide-react"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { FooterDrawer } from "@/components/footer-drawer"
import { TrajectoryCurve } from "@/components/overlays"

const SOCIAL_LINKS = [
  {
    href: "https://github.com/AshisGhosh",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://www.linkedin.com/in/ashisghosh/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://www.forbes.com/councils/forbestechcouncil/people/ashisghosh/",
    label: "Forbes Tech Council",
    icon: Newspaper,
  },
]

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between items-center p-12 md:p-24 overflow-hidden">
      <TrajectoryCurve />

      <div className="self-stretch flex items-center justify-end gap-1 relative z-10">
        {SOCIAL_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            aria-label={l.label}
            title={l.label}
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <l.icon className="h-5 w-5" />
          </a>
        ))}
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center w-full max-w-3xl relative z-10">
        <p className="font-serif italic text-5xl md:text-6xl">Hi, I&apos;m</p>
        <a
          href="https://www.linkedin.com/in/ashisghosh/"
          rel="noopener noreferrer"
          target="_blank"
          className="font-display font-bold text-8xl md:text-9xl text-warm hover:text-warm/70 transition-colors mt-2"
        >
          Ashis
        </a>
        <p className="text-xl md:text-2xl text-muted-foreground mt-6 text-center">
          Building robots at{" "}
          <a
            href="https://bot.co"
            rel="noopener noreferrer"
            target="_blank"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
            style={{ textDecorationColor: "hsl(var(--accent-warm))" }}
          >
            The Bot Company
          </a>
          . Co-founded{" "}
          <a
            href="https://peanutrobotics.com"
            rel="noopener noreferrer"
            target="_blank"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
            style={{ textDecorationColor: "hsl(var(--accent-warm))" }}
          >
            Peanut Robotics
          </a>
          .
        </p>
        <p className="font-serif italic text-base md:text-lg text-muted-foreground/80 mt-3 text-center">
          Robotics Venture Partner at{" "}
          <a
            href="https://www.joinsavant.com/"
            rel="noopener noreferrer"
            target="_blank"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
            style={{ textDecorationColor: "hsl(var(--accent-warm))" }}
          >
            Savant
          </a>
          .
        </p>
      </div>

      <div className="relative z-10">
        <FooterDrawer />
      </div>
    </main>
  )
}
