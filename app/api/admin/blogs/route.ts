import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getAllBlogs, getBlogBySlug, saveBlog, deleteBlog, type BlogPost } from "@/lib/admin/blog";
import {
  findDuplicateSlugError,
  getPublishedLocales,
  isBlogLocale,
  validateBlogForPublish,
  type BlogLocale,
} from "@/lib/admin/blog-locales";
import { buildIndexNowUrlListForBlog, submitToIndexNow } from "@/lib/indexnow";

async function validateAndNormalizeBlogForPublish(blog: BlogPost): Promise<BlogPost> {
  const requested = (blog.translations || []).filter(isBlogLocale);
  const publishedLocales: BlogLocale[] =
    requested.length > 0 ? requested : getPublishedLocales(blog);

  const validation = validateBlogForPublish(blog, publishedLocales);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const allBlogs = await getAllBlogs({ forAdmin: true });
  const duplicateError = findDuplicateSlugError(validation.blog, allBlogs, publishedLocales);
  if (duplicateError) {
    throw new Error(duplicateError);
  }

  return validation.blog;
}

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const locale = searchParams.get("locale");

    if (slug) {
      const blog = await getBlogBySlug(slug, locale || undefined, { forAdmin: true });
      return NextResponse.json(blog);
    }

    const blogs = await getAllBlogs({ forAdmin: true });
    return NextResponse.json(blogs);
  } catch (error: unknown) {
    console.error("Error fetching blogs:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blog: BlogPost = await request.json();
    const normalizedBlog = await validateAndNormalizeBlogForPublish(blog);
    await saveBlog(normalizedBlog);

    submitToIndexNow(buildIndexNowUrlListForBlog(normalizedBlog)).catch((err) => {
      console.error("IndexNow blog notify failed:", err);
    });

    return NextResponse.json({ success: true, blog: normalizedBlog });
  } catch (error: unknown) {
    console.error("Error saving blog:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Internal server error" ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get("id");

    if (!blogId) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    await deleteBlog(blogId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting blog:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
