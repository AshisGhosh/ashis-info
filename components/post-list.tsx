import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Post, Section } from "@/lib/content"
import { PostIcon } from "@/components/post-icons"

const META_LABEL_STYLE: React.CSSProperties = {
  fontVariantCaps: "all-small-caps",
  letterSpacing: "0.12em",
}

export function PostList({
  posts,
  section,
}: {
  posts: Post[]
  section: Section
}) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">Nothing here yet.</p>
  }
  return (
    <ul className="space-y-10">
      {posts.map((p) => {
        const inner = (
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 pt-1.5">
              <PostIcon name={p.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-semibold text-2xl md:text-3xl inline-flex items-center gap-2 transition-colors group-hover:text-warm">
                <span>{p.title}</span>
                {p.link && (
                  <ArrowUpRight
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden
                  />
                )}
              </div>
            <div
              className="font-mono text-xs mt-2 flex items-center gap-2 flex-wrap text-muted-foreground"
              style={META_LABEL_STYLE}
            >
              <span>{p.date}</span>
              {p.publisher && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5">
                    {p.publisher}
                  </span>
                </>
              )}
              {p.status && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                    <span aria-hidden className="text-warm">
                      ●
                    </span>
                    {p.status}
                  </span>
                </>
              )}
            </div>
            {p.summary && (
              <p className="mt-3 leading-relaxed text-sm md:text-base">
                {p.summary}
              </p>
            )}
            </div>
          </div>
        )
        return (
          <li key={p.slug}>
            {p.link ? (
              <a
                href={p.link}
                className="block group"
                rel="noopener noreferrer"
                target="_blank"
              >
                {inner}
              </a>
            ) : (
              <Link
                href={`/${section}/${p.slug}`}
                className="block group"
              >
                {inner}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
