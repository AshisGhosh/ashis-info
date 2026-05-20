import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Github } from "lucide-react"
import { getAllPosts, getPost } from "@/lib/content"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export async function generateStaticParams() {
  return getAllPosts("research")
    .filter((p) => p.hasBody)
    .map((p) => ({ slug: p.slug }))
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
      <article className="w-full max-w-3xl">
        <Link
          href="/research"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Research
        </Link>
        <h1 className="text-4xl font-bold mt-4">{post.title}</h1>
        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-3 flex-wrap">
          <span>{post.date}</span>
          {post.repo && (
            <>
              <span aria-hidden>·</span>
              <a
                href={post.repo}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground transition-colors"
              >
                <Github className="h-3.5 w-3.5" /> Code on GitHub
              </a>
            </>
          )}
        </div>
        <div
          className="prose prose-zinc dark:prose-invert mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </main>
  )
}
