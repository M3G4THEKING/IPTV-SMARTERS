"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Loader2, AlertTriangle, X } from "lucide-react";
import BlogEditor from "./BlogEditor";
import DeploymentNotification from "./DeploymentNotification";
import type { BlogPost } from "@/lib/admin/blog-shared";
import { getBlogUrl } from "@/lib/utils/blog-slugs";
import { getPublishedLocales, type BlogLocale } from "@/lib/admin/blog-locales";
import {
  getBlogLocaleLabel,
  getBlogLocaleShort,
} from "@/lib/admin/admin-locale-labels";
import type { Locale } from "@/lib/i18n";

export default function BlogsManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | undefined | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmBlog, setDeleteConfirmBlog] = useState<BlogPost | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({}); // Store blob URLs for images
  const [showDeploymentNotification, setShowDeploymentNotification] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const previewForLocale = (b: BlogPost, locale: BlogLocale) => {
    const title = (b.title[locale] || "").trim();
    const excerpt = (b.excerpt[locale] || "").trim();
    return { title: title || "Untitled", excerpt: excerpt || "No excerpt" };
  };

  const previewPrimary = (b: BlogPost) => {
    const locales = getPublishedLocales(b);
    const loc = (locales.includes(b.locale as BlogLocale)
      ? b.locale
      : locales[0] || "en") as BlogLocale;
    return { ...previewForLocale(b, loc), locale: loc };
  };

  // Helper to get slug for display
  const getSlugForDisplay = (blog: BlogPost, locale?: Locale): string => {
    if (typeof blog.slug === "string") {
      return blog.slug;
    }
    const slugRecord = blog.slug as Record<string, string>;
    const targetLocale = (locale || blog.locale) as Locale;
    return String(slugRecord[targetLocale] || "").trim();
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await fetch("/api/admin/blogs/", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
        
        // Pre-load image previews for blog featured images that might not be deployed yet
        data.forEach((blog: BlogPost) => {
          if (blog.featuredImage && !imagePreviews[blog.featuredImage]) {
            // Try to load the image, if it fails it's not deployed yet
            const img = new window.Image();
            img.onerror = () => {
              // Image not available yet, we'll just show broken image
              console.log(`Image not yet deployed: ${blog.featuredImage}`);
            };
            img.src = blog.featuredImage;
          }
        });
      }
    } catch (error) {
      console.error("Failed to load blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (blog: BlogPost) => {
    try {
      const response = await fetch("/api/admin/blogs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blog),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        blog?: BlogPost;
      };

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save blog");
      }

      if (payload.blog) {
        setBlogs((prev) => {
          const next = [...prev];
          const index = next.findIndex((item) => item.id === payload.blog!.id);
          if (index >= 0) {
            next[index] = payload.blog!;
          } else {
            next.push(payload.blog!);
          }
          return next.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
        });
      }

      setSelectedBlog(null);
      setSaveStatus("success");
      setShowDeploymentNotification(true);
    } catch (error) {
      console.error("Error saving blog:", error);
      setSaveStatus("error");
      setShowDeploymentNotification(true);
      throw error instanceof Error ? error : new Error("Failed to save blog");
    }
  };

  const handleDeleteClick = (blog: BlogPost) => {
    setDeleteConfirmBlog(blog);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmBlog(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmBlog) return;

    const blogId = deleteConfirmBlog.id;
    setIsDeleting(blogId);
    try {
      const response = await fetch(`/api/admin/blogs/?id=${blogId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      await loadBlogs();
      setSelectedBlog(null);
      setDeleteConfirmBlog(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog post");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDelete = async (blogId: string) => {
    const blog = blogs.find(b => b.id === blogId);
    if (blog) {
      setDeleteConfirmBlog(blog);
    }
  };

  // Show editor when selectedBlog is undefined (new blog) or a BlogPost object (editing)
  if (selectedBlog !== null) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setSelectedBlog(null)}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 hover:underline cursor-pointer"
          >
            ← Back to Blogs List
          </button>
        </div>
        <BlogEditor
          initialBlog={selectedBlog || undefined}
          onSave={handleSave}
          onDelete={selectedBlog && typeof selectedBlog === 'object' && 'id' in selectedBlog ? () => handleDelete(selectedBlog.id) : undefined}
        />
        <DeploymentNotification
          show={showDeploymentNotification}
          onClose={() => setShowDeploymentNotification(false)}
          type={saveStatus === "error" ? "error" : "success"}
        />
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteConfirmBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurry Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={handleDeleteCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Delete Blog Post?
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                &quot;
                {(
                  deleteConfirmBlog.title.en ||
                  deleteConfirmBlog.title.ca ||
                  deleteConfirmBlog.title.uk ||
                  deleteConfirmBlog.title.es ||
                  deleteConfirmBlog.title.fr ||
                  "Untitled"
                ).trim()}
                &quot;
              </span>
              ? This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting === deleteConfirmBlog.id}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting === deleteConfirmBlog.id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting === deleteConfirmBlog.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-black mb-1">Blog Management</h2>
            <p className="text-gray-500 text-sm">Create and manage blog posts</p>
          </div>
          <button
            onClick={() => setSelectedBlog(undefined)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Blog</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No blog posts yet.</p>
            <button
              onClick={() => setSelectedBlog(undefined)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Blog Post</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {blogs.map((blog) => (
               <div
                 key={blog.id}
                 className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
               >
                 {blog.featuredImage && !blog.featuredImage.startsWith('blob:') && (
                   <div className="relative w-full h-40 mb-3 overflow-hidden rounded-lg bg-gray-100">
                     <img
                       src={blog.featuredImage}
                       alt={previewPrimary(blog).title}
                       className="w-full h-full object-cover"
                     />
                   </div>
                 )}
                 <div className="flex flex-wrap gap-1 mb-2">
                   {getPublishedLocales(blog).map((loc) => (
                     <span
                       key={loc}
                       title={getBlogLocaleLabel(loc)}
                       className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                     >
                       {getBlogLocaleShort(loc)}
                     </span>
                   ))}
                 </div>
                 <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                   {previewPrimary(blog).title}
                 </h3>
                 <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                   {previewPrimary(blog).excerpt}
                 </p>
                 <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                   <span
                     className="truncate"
                     title={`Slugs — EN: ${getSlugForDisplay(blog, "en")} | CA: ${getSlugForDisplay(blog, "ca")} | UK: ${getSlugForDisplay(blog, "uk")} | ES: ${getSlugForDisplay(blog, "es")} | FR: ${getSlugForDisplay(blog, "fr")}`}
                   >
                     /{previewPrimary(blog).locale}/blog/{getSlugForDisplay(blog, previewPrimary(blog).locale)}/
                   </span>
                   <span className="whitespace-nowrap ml-2">
                     {new Date(blog.publishedAt).toLocaleDateString()}
                   </span>
                 </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBlog(blog)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <a
                    href={getBlogUrl(blog, previewPrimary(blog).locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                  <button
                    onClick={() => handleDeleteClick(blog)}
                    disabled={isDeleting === blog.id}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-sm font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting === blog.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Deployment Notification */}
      <DeploymentNotification
        show={showDeploymentNotification}
        onClose={() => setShowDeploymentNotification(false)}
        type={saveStatus === "error" ? "error" : "success"}
      />
    </div>
    </>
  );
}

