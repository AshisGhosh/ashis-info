import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

export type Section = "writing" | "research" | "projects"

export type Post = {
  slug: string
  title: string
  date: string
  summary?: string
  link?: string
  repo?: string
  publisher?: string
  hasBody: boolean
}

const PUBLISHER_FROM_HOST: Record<string, string> = {
  "forbes.com": "Forbes",
  "substack.com": "Substack",
  "medium.com": "Medium",
  "github.com": "GitHub",
}

function inferPublisher(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    if (PUBLISHER_FROM_HOST[host]) return PUBLISHER_FROM_HOST[host]
    const base = Object.keys(PUBLISHER_FROM_HOST).find((h) => host.endsWith(h))
    return base ? PUBLISHER_FROM_HOST[base] : undefined
  } catch {
    return undefined
  }
}

function normalizeDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return String(d ?? "")
}

function toPost(
  slug: string,
  data: Record<string, unknown>,
  content: string,
): Post {
  const link = data.link ? String(data.link) : undefined
  const repo = data.repo ? String(data.repo) : undefined
  const publisher = data.publisher
    ? String(data.publisher)
    : inferPublisher(link) ?? inferPublisher(repo)
  return {
    slug,
    title: String(data.title ?? slug),
    date: normalizeDate(data.date),
    summary: data.summary ? String(data.summary) : undefined,
    link,
    repo,
    publisher,
    hasBody: content.trim().length > 0,
  }
}

function dirFor(section: Section): string {
  return path.join(process.cwd(), "content", section)
}

export function getAllPosts(section: Section): Post[] {
  const dir = dirFor(section)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "")
      const raw = fs.readFileSync(path.join(dir, f), "utf8")
      const { data, content } = matter(raw)
      return toPost(slug, data, content)
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPost(
  section: Section,
  slug: string,
): Promise<{ post: Post; contentHtml: string } | null> {
  const file = path.join(dirFor(section), `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, "utf8")
  const { data, content } = matter(raw)
  const processed = await remark().use(html).process(content)
  return {
    post: toPost(slug, data, content),
    contentHtml: processed.toString(),
  }
}
