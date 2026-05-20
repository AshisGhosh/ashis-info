import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Github } from "lucide-react"
import { getAllPosts, getPost } from "@/lib/content"
import { PostIcon } from "@/components/post-icons"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export async function generateStaticParams() {
  return getAllPosts("research")
    .filter((p) => p.hasBody)
    .map((p) => ({ slug: p.slug }))
}

const META_LABEL_STYLE: React.CSSProperties = {
  fontVariantCaps: "all-small-caps",
  letterSpacing: "0.12em",
}

export default async function ResearchPost({
  params,
}: {
  params: { slug: string }
}) {
  const result = await getPost("research", params.slug)
  if (!result || !result.post.hasBody) notFound()
  const { post, contentHtml } = result
  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <article className="w-full max-w-4xl">
        <Link
          href="/research"
          className="font-mono text-xs text-muted-foreground hover:text-warm transition-colors"
          style={{
            fontVariantCaps: "all-small-caps",
            letterSpacing: "0.15em",
          }}
        >
          ← Research
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-10 gap-y-6 mt-10">
          <div className="md:pt-2 font-mono text-sm text-muted-foreground flex flex-col items-start gap-3">
            {post.icon && <PostIcon name={post.icon} />}
            <span style={META_LABEL_STYLE}>{post.date}</span>
            {post.repo && (
              <a
                href={post.repo}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-warm transition-colors"
                style={{ textDecorationColor: "hsl(var(--accent-warm))" }}
              >
                <Github className="h-3.5 w-3.5" /> Code on GitHub
              </a>
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-warm leading-tight">
              {post.title}
            </h1>
            <div
              className="prose mt-10 max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </article>
    </main>
  )
}
