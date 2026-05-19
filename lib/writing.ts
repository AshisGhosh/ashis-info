import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const DIR = path.join(process.cwd(), "content/writing")

export type Post = {
  slug: string
  title: string
  date: string
  summary?: string
  link?: string
  publisher?: string
}

function normalizeDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return String(d ?? "")
}

const PUBLISHER_FROM_HOST: Record<string, string> = {
  "forbes.com": "Forbes",
  "substack.com": "Substack",
  "medium.com": "Medium",
  "github.com": "GitHub",
}

function inferPublisher(link?: string): string | undefined {
  if (!link) return undefined
  try {
    const host = new URL(link).hostname.replace(/^www\./, "")
    if (PUBLISHER_FROM_HOST[host]) return PUBLISHER_FROM_HOST[host]
    const base = Object.keys(PUBLISHER_FROM_HOST).find((h) => host.endsWith(h))
    return base ? PUBLISHER_FROM_HOST[base] : undefined
  } catch {
    return undefined
  }
}

function toPost(slug: string, data: Record<string, unknown>): Post {
  const link = data.link ? String(data.link) : undefined
  const publisher = data.publisher ? String(data.publisher) : inferPublisher(link)
  return {
    slug,
    title: String(data.title ?? slug),
    date: normalizeDate(data.date),
    summary: data.summary ? String(data.summary) : undefined,
    link,
    publisher,
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(DIR)) return []
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "")
      const { data } = matter(fs.readFileSync(path.join(DIR, f), "utf8"))
      return toPost(slug, data)
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPost(
  slug: string,
): Promise<{ post: Post; contentHtml: string } | null> {
  const file = path.join(DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  const processed = await remark().use(html).process(content)
  return { post: toPost(slug, data), contentHtml: processed.toString() }
}
