import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllPosts, getPost } from "@/lib/writing"

export async function generateStaticParams() {
  return getAllPosts()
    .filter((p) => !p.link)
    .map((p) => ({ slug: p.slug }))
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function WritingPost({
  params,
}: {
  params: { slug: string }
}) {
  const result = await getPost(params.slug)
  if (!result || result.post.link) notFound()
  const { post, contentHtml } = result
  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <article className="w-full max-w-2xl">
        <Link
          href="/writing"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Writing
        </Link>
        <h1 className="text-4xl font-bold mt-4">{post.title}</h1>
        <div className="text-sm text-muted-foreground mt-1">{post.date}</div>
        <div
          className="prose prose-zinc dark:prose-invert mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </main>
  )
}
