import Link from "next/link"
import type { Metadata } from "next"
import { getAllPosts } from "@/lib/content"
import { PostList } from "@/components/post-list"

export const metadata: Metadata = {
  title: "Writing",
  robots: { index: false, follow: false },
}

export default function WritingIndex() {
  const posts = getAllPosts("writing")
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
          Writing
        </h1>
        <p className="text-muted-foreground mt-4 mb-12 leading-relaxed">
          Mostly notes on robotics, AI, and the gap between a great demo and
          something that runs every night. I write to pin down lessons before I
          forget them. Maybe it saves someone else a few of the dead ends I
          walked into.
        </p>
        <PostList posts={posts} section="writing" />
      </div>
    </main>
  )
}
