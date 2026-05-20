import Link from "next/link"
import type { Metadata } from "next"
import { getAllPosts } from "@/lib/content"
import { PostList } from "@/components/post-list"

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
          className="font-mono text-xs text-muted-foreground hover:text-warm transition-colors"
          style={{
            fontVariantCaps: "all-small-caps",
            letterSpacing: "0.15em",
          }}
        >
          ← Home
        </Link>
        <h1 className="font-display font-bold text-5xl md:text-6xl text-warm mt-6">
          Projects
        </h1>
        <p className="text-muted-foreground mt-4 mb-12 leading-relaxed">
          Projects across robotics, simulation, and ML infrastructure. Things I
          wanted to build, either to test an idea or because no existing tool
          fit.
        </p>
        <PostList posts={posts} section="projects" />
      </div>
    </main>
  )
}
