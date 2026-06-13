import { NextRequest, NextResponse } from "next/server";
import { getAllBlogs, getBlogBySlug } from "@/lib/admin/blog";

const PUBLIC_BLOG_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400";

// Public API endpoint for fetching blogs (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const locale = searchParams.get("locale");

    if (slug) {
      const blog = await getBlogBySlug(slug, locale || undefined);
      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }
      return NextResponse.json(blog, {
        headers: { "Cache-Control": PUBLIC_BLOG_CACHE },
      });
    }

    const blogs = await getAllBlogs();
    return NextResponse.json(blogs, {
      headers: { "Cache-Control": PUBLIC_BLOG_CACHE },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
