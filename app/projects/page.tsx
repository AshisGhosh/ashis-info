import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { getAllPosts } from "@/lib/content"

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
}

export default function ProjectsIndex() {
  const posts = getAllPosts("projects")
  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Home
        </Link>
        <h1 className="text-4xl font-bold mt-4">Projects</h1>
        <p className="text-muted-foreground mt-3 mb-10 leading-relaxed">
          Projects across robotics, simulation, and ML infrastructure. Things I
          wanted to build, either to test an idea or because no existing tool
          fit.
        </p>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => {
              const inner = (
                <>
                  <div className="text-xl inline-flex items-center gap-1.5">
                    <span>{p.title}</span>
                    {p.link && (
                      <ArrowUpRight
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    <span>{p.date}</span>
                    {p.publisher && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                          {p.publisher}
                        </span>
                      </>
                    )}
                    {p.status && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs">
                          <span aria-hidden className="text-primary">●</span>
                          {p.status}
                        </span>
                      </>
                    )}
                  </div>
                  {p.summary && <p className="text-sm mt-2">{p.summary}</p>}
                </>
              )
              return (
                <li key={p.slug}>
                  {p.link ? (
                    <a
                      href={p.link}
                      className="block hover:text-primary/70"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      href={`/projects/${p.slug}`}
                      className="block hover:text-primary/70"
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
