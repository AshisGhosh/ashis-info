import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { getAllPosts } from "@/lib/content"

export const metadata: Metadata = {
  title: "Research",
  robots: { index: false, follow: false },
}

export default function ResearchIndex() {
  const posts = getAllPosts("research")
  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Home
        </Link>
        <h1 className="text-4xl font-bold mt-4">Research</h1>
        <p className="text-muted-foreground mt-3 mb-10 leading-relaxed">
          Generative models, world models, robotics learning. Side experiments
          where I dig into a problem until I understand it well enough to write
          down what I learned.
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
                      href={`/research/${p.slug}`}
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
