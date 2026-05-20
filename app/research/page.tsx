import Link from "next/link"
import type { Metadata } from "next"
import { getAllPosts } from "@/lib/content"
import { PostList } from "@/components/post-list"

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
          className="font-mono text-xs text-muted-foreground hover:text-warm transition-colors"
          style={{
            fontVariantCaps: "all-small-caps",
            letterSpacing: "0.15em",
          }}
        >
          ← Home
        </Link>
        <h1 className="font-display font-bold text-5xl md:text-6xl text-warm mt-6">
          Research
        </h1>
        <p className="text-muted-foreground mt-4 mb-12 leading-relaxed">
          Generative models, world models, robotics learning. Side experiments
          where I dig into a problem until I understand it well enough to write
          down what I learned.
        </p>
        <PostList posts={posts} section="research" />
      </div>
    </main>
  )
}
