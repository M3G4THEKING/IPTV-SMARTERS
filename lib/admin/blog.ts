import { Octokit } from "@octokit/rest";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  type BlogPost,
} from "@/lib/admin/blog-shared";

export {
  type BlogBlock,
  type BlogPost,
} from "@/lib/admin/blog-shared";

/** GitHub is only required when calling blog persistence APIs — not when importing types/helpers. */
function getGithubBlogContext() {
  const token = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPO;
  const owner = repoFull?.split("/")[0];
  const repo = repoFull?.split("/")[1];
  const branch = process.env.GITHUB_BRANCH || "main";
  const email = process.env.GITHUB_EMAIL;
  const name = process.env.GITHUB_NAME;
  if (!token || !owner || !repo || !email || !name) {
    throw new Error("Missing GitHub environment variables for blog system.");
  }
  return {
    octokit: new Octokit({ auth: token }),
    owner,
    repo,
    branch,
    email,
    name,
  };
}

function hasGithubBlogContext(): boolean {
  const token = process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPO;
  const email = process.env.GITHUB_EMAIL;
  const name = process.env.GITHUB_NAME;
  return Boolean(token && repoFull?.includes("/") && email && name);
}

function normalizeLocaleTextMap(input: unknown): Record<string, string> {
  const raw = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  return {
    en: typeof raw.en === "string" ? raw.en : "",
    ca: typeof raw.ca === "string" ? raw.ca : "",
    uk: typeof raw.uk === "string" ? raw.uk : "",
    es: typeof raw.es === "string" ? raw.es : "",
    fr: typeof raw.fr === "string" ? raw.fr : "",
  };
}

function toIsoOrNow(input: unknown): string {
  if (typeof input === "string") {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeBlogPost(blog: BlogPost): BlogPost {
  const safeLocale = typeof blog.locale === "string" && blog.locale ? blog.locale : "en";
  const normalizedSlug =
    typeof blog.slug === "string"
      ? blog.slug
      : {
          en: typeof blog.slug?.en === "string" ? blog.slug.en : "",
          ca: typeof blog.slug?.ca === "string" ? blog.slug.ca : "",
          uk: typeof blog.slug?.uk === "string" ? blog.slug.uk : "",
          es: typeof blog.slug?.es === "string" ? blog.slug.es : "",
          fr: typeof blog.slug?.fr === "string" ? blog.slug.fr : "",
        };

  return {
    ...blog,
    id: typeof blog.id === "string" && blog.id.trim() ? blog.id : `blog-${Date.now()}`,
    slug: normalizedSlug,
    title: normalizeLocaleTextMap(blog.title),
    excerpt: normalizeLocaleTextMap(blog.excerpt),
    locale: safeLocale,
    translations: Array.isArray(blog.translations)
      ? blog.translations.filter((v) => typeof v === "string" && v.trim())
      : [safeLocale],
    publishedAt: toIsoOrNow(blog.publishedAt),
    updatedAt: toIsoOrNow(blog.updatedAt),
    blocks: Array.isArray(blog.blocks) ? blog.blocks : [],
    meta: {
      ...blog.meta,
      description: normalizeLocaleTextMap(blog.meta?.description),
      keywords: normalizeLocaleTextMap(blog.meta?.keywords),
    },
  };
}

const BLOG_DATA_PATH = "data/blogs.json";

async function getLocalBlogs(): Promise<BlogPost[]> {
  try {
    const filePath = path.join(process.cwd(), BLOG_DATA_PATH);
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as BlogPost[];
    return Array.isArray(parsed) ? parsed.map(normalizeBlogPost) : [];
  } catch (error: unknown) {
    if ((error as { code?: string })?.code !== "ENOENT") {
      console.error("Error reading local blogs:", error);
    }
    return [];
  }
}

function countCanadaLocales(blogs: BlogPost[]): number {
  return blogs.filter((b) => (b.translations || []).includes("ca")).length;
}

function sortBlogsNewestFirst(blogs: BlogPost[]): BlogPost[] {
  return [...blogs].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Merge GitHub + repo `data/blogs.json`. Prefer local when it has Canada publishes
 * missing on remote, or when a post was updated locally more recently.
 */
function mergeBlogSources(remote: BlogPost[], local: BlogPost[]): BlogPost[] {
  if (local.length === 0) return sortBlogsNewestFirst(remote);
  if (remote.length === 0) return sortBlogsNewestFirst(local);

  const byId = new Map<string, BlogPost>();
  for (const post of remote) {
    byId.set(post.id, post);
  }

  for (const localPost of local) {
    const remotePost = byId.get(localPost.id);
    if (!remotePost) {
      byId.set(localPost.id, localPost);
      continue;
    }

    const localHasCa = (localPost.translations || []).includes("ca");
    const remoteHasCa = (remotePost.translations || []).includes("ca");
    const localHasUk = (localPost.translations || []).includes("uk");
    const remoteHasUk = (remotePost.translations || []).includes("uk");
    const localUpdated = new Date(localPost.updatedAt).getTime();
    const remoteUpdated = new Date(remotePost.updatedAt).getTime();

    if (
      (localHasCa && !remoteHasCa) ||
      (localHasUk && !remoteHasUk) ||
      localUpdated > remoteUpdated
    ) {
      byId.set(localPost.id, localPost);
    }
  }

  return sortBlogsNewestFirst(Array.from(byId.values()));
}

async function getGithubBlogs(): Promise<BlogPost[]> {
  const { octokit, owner, repo, branch } = getGithubBlogContext();
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: BLOG_DATA_PATH,
    ref: branch,
  });

  const data = response.data;
  if (
    response.status !== 200 ||
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    !("content" in data)
  ) {
    return [];
  }

  const file = data as { content: string };
  if (typeof file.content !== "string") {
    return [];
  }

  const content = Buffer.from(file.content, "base64").toString("utf8");
  const parsed = JSON.parse(content) as BlogPost[];
  return Array.isArray(parsed) ? parsed.map(normalizeBlogPost) : [];
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const local = await getLocalBlogs();

  // Public read-path must keep working even when GitHub env vars are missing.
  if (!hasGithubBlogContext()) {
    return local;
  }

  try {
    const remote = await getGithubBlogs();
    const merged = mergeBlogSources(remote, local);

    if (countCanadaLocales(local) > countCanadaLocales(remote)) {
      console.info(
        "[blogs] Merged local data/blogs.json (includes Canada locales not yet on GitHub)."
      );
    }

    return merged;
  } catch (error: unknown) {
    if ((error as { status?: number })?.status === 404) {
      return local;
    }
    console.error("Error fetching blogs from GitHub:", error);
    return local.length > 0 ? local : [];
  }
}

export async function getBlogBySlug(slug: string, locale?: string): Promise<BlogPost | null> {
  const blogs = await getAllBlogs();
  const targetSlug = safeDecode(slug).trim();
  
  // Find blog by slug - support both old format (string) and new format (Record<string, string>)
  const blog = blogs.find((b) => {
    if (typeof b.slug === 'string') {
      // Old format: direct match
      return safeDecode(b.slug).trim() === targetSlug;
    } else if (typeof b.slug === 'object' && b.slug !== null) {
      // New format: check all locales
      const slugRecord = b.slug as Record<string, string>;
      // If locale is specified, check that locale first, then fallback to all
      if (locale && safeDecode(slugRecord[locale] || '').trim() === targetSlug) {
        return true;
      }
      // Check all locales
      return Object.values(slugRecord).some((s) => safeDecode(s).trim() === targetSlug);
    }
    return false;
  });
  
  if (!blog) return null;
  
  // Always return the blog - the page component will handle locale fallbacks
  // This ensures Googlebot can index the page even if not fully translated
  return blog;
}

export async function saveBlog(blog: BlogPost): Promise<void> {
  try {
    const { octokit, owner, repo, branch, email, name } = getGithubBlogContext();
    const blogs = await getAllBlogs();
    const existingIndex = blogs.findIndex((b) => b.id === blog.id);
    
    if (existingIndex >= 0) {
      blogs[existingIndex] = blog;
    } else {
      blogs.push(blog);
    }

    // Sort by publishedAt (newest first)
    blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const content = JSON.stringify(blogs, null, 2);
    
    // Try to get existing file to get SHA
    let sha: string | undefined;
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: BLOG_DATA_PATH,
        ref: branch,
      });
      if (response.status === 200 && "sha" in response.data) {
        sha = response.data.sha;
      }
    } catch (error: unknown) {
      // File doesn't exist, will create new
      if ((error as { status?: number })?.status !== 404) throw error;
    }

    // Use createOrUpdateFileContents which works for both create and update
    const slugDisplay = typeof blog.slug === 'string' 
      ? blog.slug 
      : (blog.slug[blog.locale] || blog.slug['en'] || Object.values(blog.slug)[0] || 'blog');
    
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: BLOG_DATA_PATH,
      message: sha 
        ? `Update blog: ${blog.title[blog.locale] || slugDisplay}`
        : `Create blog: ${blog.title[blog.locale] || slugDisplay}`,
      content: Buffer.from(content).toString("base64"),
      sha: sha, // Include SHA if updating existing file
      branch,
      committer: {
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Error saving blog:", error);
    throw error;
  }
}

export async function deleteBlog(blogId: string): Promise<void> {
  try {
    const { octokit, owner, repo, branch, email, name } = getGithubBlogContext();
    const blogs = await getAllBlogs();
    const filtered = blogs.filter((b) => b.id !== blogId);
    
    const content = JSON.stringify(filtered, null, 2);
    
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: BLOG_DATA_PATH,
      ref: branch,
    });
    
    if (response.status === 200 && "sha" in response.data) {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: BLOG_DATA_PATH,
        message: `Delete blog: ${blogId}`,
        content: Buffer.from(content).toString("base64"),
        sha: response.data.sha,
        branch,
        committer: {
          name,
          email,
        },
      });
    }
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
}

