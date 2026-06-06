"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Save,
  X,
  Loader2,
  Check,
  Upload,
  Type,
  Image as ImageIcon,
  List,
  Quote,
  Heading,
  MoveUp,
  MoveDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag,
  Bold,
  Italic,
  Link as LinkIcon,
} from "lucide-react";
import {
  type BlogPost,
  type BlogBlock,
} from "@/lib/admin/blog-shared";
import {
  emptyLocaleListMap,
  emptyLocaleTextMap,
  getPublishedLocales,
  normalizeBlogSlugRecord,
  type BlogLocale,
} from "@/lib/admin/blog-locales";
import {
  getBlogBlockTextPlaceholder,
  getBlogExcerptPlaceholder,
  getBlogLocaleLabel,
  getBlogLocaleShort,
  getBlogMetaDescriptionPlaceholder,
  getBlogSlugPlaceholder,
  getBlogTitlePlaceholder,
} from "@/lib/admin/admin-locale-labels";
import BlogLocaleToolbar from "@/components/admin/BlogLocaleToolbar";

interface BlogEditorProps {
  onSave: (blog: BlogPost) => Promise<void>;
  onDelete?: (blogId: string) => Promise<void>;
  initialBlog?: BlogPost;
}

export default function BlogEditor({ onSave, onDelete, initialBlog }: BlogEditorProps) {
  const [blog, setBlog] = useState<BlogPost>(
    initialBlog || {
      id: "",
      slug: { en: "", ca: "", uk: "", es: "", fr: "" },
      title: { en: "", ca: "", uk: "", es: "", fr: "" },
      excerpt: { en: "", ca: "", uk: "", es: "", fr: "" },
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locale: "en",
      translations: ["en"],
      blocks: [],
      meta: {
        description: { en: "", ca: "", uk: "", es: "", fr: "" },
        keywords: { en: "", ca: "", uk: "", es: "", fr: "" },
      },
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<BlogLocale>("en");
  const [primaryLocale, setPrimaryLocale] = useState<BlogLocale>("en");
  const [publishedLocales, setPublishedLocales] = useState<BlogLocale[]>(["en"]);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  const [pendingUploads, setPendingUploads] = useState<Set<string>>(new Set());
  const [blockLocales, setBlockLocales] = useState<Record<string, BlogLocale>>({});

  useEffect(() => {
    if (initialBlog) {
      // Ensure meta field exists with keywords
      // Also ensure slug is in new format (Record<string, string>)
      const blogWithMeta = {
        ...initialBlog,
        slug: normalizeBlogSlugRecord(initialBlog.slug),
        title: { ...emptyLocaleTextMap(), ...initialBlog.title },
        excerpt: { ...emptyLocaleTextMap(), ...initialBlog.excerpt },
        meta: {
          ...initialBlog.meta,
          description: {
            ...emptyLocaleTextMap(),
            ...initialBlog.meta?.description,
          },
          keywords: {
            ...emptyLocaleTextMap(),
            ...initialBlog.meta?.keywords,
          },
        },
      };
      setBlog(blogWithMeta);
      const published = getPublishedLocales(blogWithMeta);
      const primary = (blogWithMeta.locale as BlogLocale) || published[0] || "en";
      setPublishedLocales(published);
      setPrimaryLocale(primary);
      setActiveLocale(primary);
    }
  }, [initialBlog]);

  const applyToLocales = (
    value: string,
    field: "title" | "excerpt",
    targets: BlogLocale[]
  ): Record<BlogLocale, string> => {
    const current: Record<BlogLocale, string> = { en: "", ca: "", uk: "", es: "", fr: "", ...blog[field] };
    const next = { ...current };
    for (const loc of targets) {
      next[loc] = value;
    }
    return next;
  };

  const applyMetaDescription = (value: string, targets: BlogLocale[]) => {
    const current = { en: "", ca: "", uk: "", es: "", fr: "", ...blog.meta?.description };
    const description = { ...current };
    for (const loc of targets) {
      description[loc] = value;
    }
    return description;
  };

  const applyMetaKeywords = (value: string, targets: BlogLocale[]) => {
    const current = { en: "", ca: "", uk: "", es: "", fr: "", ...blog.meta?.keywords };
    const keywords = { ...current };
    for (const loc of targets) {
      keywords[loc] = value;
    }
    return keywords;
  };

  const mirrorTargets = (): BlogLocale[] =>
    mirrorMode ? publishedLocales : [activeLocale];

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const getSlug = (locale: BlogLocale): string => {
    if (typeof blog.slug === "string") {
      return blog.slug;
    }
    const slugRecord = blog.slug as Record<string, string>;
    return String(slugRecord[locale] || "").trim();
  };

  // Helper to set slug for a locale
  const setSlug = (locale: BlogLocale, value: string) => {
    const currentSlug = normalizeBlogSlugRecord(blog.slug);
    
    setBlog({
      ...blog,
      slug: {
        ...currentSlug,
        [locale]: value,
      },
    });
  };

  const handleSave = async () => {
    // Check if there are any pending uploads
    if (pendingUploads.size > 0 || isUploading) {
      alert("Please wait for image uploads to complete before saving.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const cleanedSlug = normalizeBlogSlugRecord(blog.slug);

      // Clean up blob URLs before saving - ensure we only save Cloudinary URLs
      const cleanedBlog = {
        ...blog,
        id: blog.id || generateId(),
        slug: cleanedSlug,
        updatedAt: new Date().toISOString(),
        publishedAt: blog.publishedAt || new Date().toISOString(),
        locale: primaryLocale,
        translations: publishedLocales,
        // Ensure featured image is not a blob URL (Cloudinary URLs are https://)
        featuredImage: blog.featuredImage?.startsWith('blob:') ? undefined : blog.featuredImage,
        // Clean up block image URLs
        blocks: blog.blocks.map(block => {
          if (block.type === 'image' && block.imageUrl?.startsWith('blob:')) {
            // If it's still a blob URL, it means upload didn't complete - remove it
            return { ...block, imageUrl: undefined };
          }
          return block;
        }),
      };
      
      await onSave(cleanedBlog);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving blog:", error);
      setSaveStatus("error");
      alert(error instanceof Error ? error.message : "Failed to save blog.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    // Create immediate preview using blob URL
    const previewUrl = URL.createObjectURL(file);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog-images");

      const response = await fetch("/api/admin/upload-cloudinary/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      
      // Store both preview URL and actual Cloudinary URL mapping
      setImagePreviewUrls(prev => ({
        ...prev,
        [data.url]: previewUrl
      }));
      
      // Return Cloudinary URL (immediately accessible via CDN)
      return data.url;
    } catch (error) {
      console.error("Upload failed:", error);
      // Revoke the blob URL on error
      URL.revokeObjectURL(previewUrl);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to get content for current locale (supports both old string format and new multi-language format)
  const getBlockContent = (block: BlogBlock, locale: string): string => {
    if (typeof block.content === "string") {
      return block.content;
    }
    if (block.content && typeof block.content === "object") {
      return String(block.content[locale] || "").trim();
    }
    return "";
  };

  // Helper to set content for current locale
  const setBlockContent = (blockId: string, locale: BlogLocale, value: string) => {
    const targets = mirrorMode ? publishedLocales : [locale];
    setBlog({
      ...blog,
      blocks: blog.blocks.map((block) => {
        if (block.id !== blockId) return block;

        let content: Record<string, string>;
        if (typeof block.content === "string") {
          content = { ...emptyLocaleTextMap(), en: block.content };
        } else {
          content = { en: "", ca: "", uk: "", es: "", fr: "", ...(block.content as Record<string, string>) };
        }
        for (const loc of targets) {
          content[loc] = value;
        }

        return { ...block, content };
      }),
    });
  };

  const addBlock = (type: BlogBlock["type"]) => {
    const newBlock: BlogBlock = {
      id: generateId(),
      type,
      content: { en: "", ca: "", uk: "", es: "", fr: "" }, // Initialize as multi-language
      ...(type === "heading" && { level: 2 }),
      ...(type === "list" && {
        listItems: Object.fromEntries(
          (["en", "ca", "uk", "es", "fr"] as BlogLocale[]).map((loc) => [loc, [""]])
        ) as Record<BlogLocale, string[]>,
      }),
    };

    setBlog({
      ...blog,
      blocks: [...blog.blocks, newBlock],
    });
    setEditingBlockId(newBlock.id);
    
    // Scroll to the new block after a short delay
    setTimeout(() => {
      const element = document.getElementById(`block-${newBlock.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateBlock = (blockId: string, updates: Partial<BlogBlock>) => {
    setBlog({
      ...blog,
      blocks: blog.blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
    });
  };

  const deleteBlock = (blockId: string) => {
    setBlog({
      ...blog,
      blocks: blog.blocks.filter((block) => block.id !== blockId),
    });
    if (editingBlockId === blockId) {
      setEditingBlockId(null);
    }
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const index = blog.blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blog.blocks.length) return;

    const newBlocks = [...blog.blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

    setBlog({ ...blog, blocks: newBlocks });
  };

  const handleImageBlockUpload = async (blockId: string, file: File) => {
    // Create immediate preview
    const previewUrl = URL.createObjectURL(file);
    
    // Mark as uploading
    setPendingUploads(prev => new Set(prev).add(blockId));
    
    // Show preview immediately with blob URL
    updateBlock(blockId, { imageUrl: previewUrl });
    
    try {
      const url = await handleImageUpload(file);
      // Update with actual GitHub URL after upload completes
      // This ensures we save the real URL, not the blob URL
      updateBlock(blockId, { imageUrl: url });
      
      // Clean up blob URL after successful upload
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
      // Revert to no image on error
      updateBlock(blockId, { imageUrl: undefined });
      URL.revokeObjectURL(previewUrl);
      alert("Failed to upload image. Please try again.");
    } finally {
      // Remove from pending uploads
      setPendingUploads(prev => {
        const next = new Set(prev);
        next.delete(blockId);
        return next;
      });
    }
  };
  
  // Helper to get display URL (preview if available, otherwise actual URL)
  const getImageDisplayUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    // If we have a preview URL for this image, use it
    return imagePreviewUrls[url] || url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-black mb-1">
              {initialBlog ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <p className="text-gray-500 text-sm">Design your blog post with complete freedom</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "success" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : saveStatus === "error" ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Error</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Blog</span>
                </>
              )}
            </button>
            {initialBlog && onDelete && (
              <button
                onClick={() => onDelete(blog.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        <BlogLocaleToolbar
          blog={blog}
          activeLocale={activeLocale}
          primaryLocale={primaryLocale}
          publishedLocales={publishedLocales}
          mirrorMode={mirrorMode}
          onBlogChange={setBlog}
          onActiveLocaleChange={setActiveLocale}
          onPrimaryLocaleChange={setPrimaryLocale}
          onPublishedLocalesChange={setPublishedLocales}
          onMirrorModeChange={setMirrorMode}
        />

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL slug (per published language)
            </label>
            <div className="space-y-2">
              {publishedLocales.map((loc) => (
                <div key={loc}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {getBlogLocaleLabel(loc)} ({getBlogLocaleShort(loc)})
                  </label>
                  <input
                    type="text"
                    value={getSlug(loc)}
                    onChange={(e) => setSlug(loc, e.target.value)}
                    placeholder={getBlogSlugPlaceholder(loc)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Preview: /{loc}/blog/{getSlug(loc) || "your-slug"}/
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author (Optional)</label>
            <input
              type="text"
              value={blog.author || ""}
              onChange={(e) => setBlog({ ...blog, author: e.target.value })}
              placeholder="Author name"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Title and Excerpt */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title — {getBlogLocaleLabel(activeLocale)}
            </label>
            <input
              type="text"
              value={blog.title[activeLocale] || ""}
              onChange={(e) => {
                const targets = mirrorTargets();
                setBlog({
                  ...blog,
                  title: applyToLocales(e.target.value, "title", targets),
                });
              }}
              placeholder={getBlogTitlePlaceholder(activeLocale)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt — {getBlogLocaleLabel(activeLocale)} (listing page)
            </label>
            <textarea
              value={blog.excerpt[activeLocale] || ""}
              onChange={(e) => {
                const targets = mirrorTargets();
                setBlog({
                  ...blog,
                  excerpt: applyToLocales(e.target.value, "excerpt", targets),
                });
              }}
              rows={3}
              placeholder={getBlogExcerptPlaceholder(activeLocale)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO meta description — {getBlogLocaleLabel(activeLocale)}
            </label>
            <textarea
              value={blog.meta?.description?.[activeLocale] || ""}
              onChange={(e) => {
                const targets = mirrorTargets();
                setBlog({
                  ...blog,
                  meta: {
                    ...blog.meta,
                    description: applyMetaDescription(e.target.value, targets),
                  },
                });
              }}
              rows={3}
              placeholder={getBlogMetaDescriptionPlaceholder(activeLocale)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the primary SEO description for this language. Listing cards still use the excerpt above.
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span>SEO Keywords — {getBlogLocaleLabel(activeLocale)} (comma-separated, not visible on site)</span>
            </label>
            <textarea
              value={blog.meta?.keywords?.[activeLocale] || ""}
              onChange={(e) => {
                const targets = mirrorTargets();
                setBlog({
                  ...blog,
                  meta: {
                    ...blog.meta,
                    keywords: applyMetaKeywords(e.target.value, targets),
                  },
                });
              }}
              placeholder="keyword1, keyword2, keyword3"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter keywords separated by commas. These will be added to meta tags for SEO but will not be visible on the website.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image (Optional)
            </label>
            <div className="space-y-3">
              {blog.featuredImage && (
                <div className="relative w-full max-w-md">
                  <img
                    src={getImageDisplayUrl(blog.featuredImage)}
                    alt="Featured"
                    className="w-full h-auto max-h-64 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => {
                      const url = blog.featuredImage;
                      if (url && imagePreviewUrls[url]) {
                        URL.revokeObjectURL(imagePreviewUrls[url]);
                      }
                      setBlog({ ...blog, featuredImage: undefined });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Uploading..." : blog.featuredImage ? "Change Image" : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Show preview immediately
                      const previewUrl = URL.createObjectURL(file);
                      setBlog({ ...blog, featuredImage: previewUrl });
                      
                      // Mark as uploading
                      setPendingUploads(prev => new Set(prev).add('featured'));
                      
                      try {
                        const url = await handleImageUpload(file);
                        // Update with actual GitHub URL after upload
                        setBlog({ ...blog, featuredImage: url });
                        // Clean up blob URL
                        URL.revokeObjectURL(previewUrl);
                      } catch (error) {
                        console.error("Failed to upload:", error);
                        // Revert on error
                        setBlog({ ...blog, featuredImage: undefined });
                        URL.revokeObjectURL(previewUrl);
                        alert("Failed to upload image. Please try again.");
                      } finally {
                        // Remove from pending uploads
                        setPendingUploads(prev => {
                          const next = new Set(prev);
                          next.delete('featured');
                          return next;
                        });
                      }
                    }
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-black mb-1">Content blocks</h3>
            <p className="text-gray-500 text-sm">
              Use block language tabs for per-language text, or turn on mirror editing above. Images are shared across languages.
            </p>
          </div>
        </div>

        {/* Floating Add Block Button - Sticky at bottom */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex flex-col gap-2">
            <button
              onClick={() => addBlock("heading")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              title="Add Heading"
            >
              <Heading className="w-4 h-4" />
              <span className="hidden sm:inline">Heading</span>
            </button>
            <button
              onClick={() => addBlock("paragraph")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              title="Add Text"
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Text</span>
            </button>
            <button
              onClick={() => addBlock("image")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              title="Add Image"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Image</span>
            </button>
            <button
              onClick={() => addBlock("quote")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              title="Add Quote"
            >
              <Quote className="w-4 h-4" />
              <span className="hidden sm:inline">Quote</span>
            </button>
            <button
              onClick={() => addBlock("list")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              title="Add List"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-4 pb-24">
          {blog.blocks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No content blocks yet. Click the buttons above to add content.</p>
            </div>
          )}
          {blog.blocks.map((block, index) => {
            const blockLocale = blockLocales[block.id] || activeLocale;
            const setBlockLocale = (loc: BlogLocale) => {
              setBlockLocales((prev) => ({ ...prev, [block.id]: loc }));
            };
            const currentContent = getBlockContent(block, blockLocale);
            
            return (
            <div
              key={block.id}
              id={`block-${block.id}`}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors mb-4"
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={index === blog.blocks.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 text-red-400 hover:text-red-600 mt-2"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Block Content */}
                <div className="flex-1">
                  {/* Language Tabs for Text-based Blocks */}
                  {(block.type === "heading" || block.type === "paragraph" || block.type === "quote" || block.type === "list") && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Language:</span>
                      {publishedLocales.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setBlockLocale(loc)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            blockLocale === loc
                              ? "bg-[#2563eb] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {getBlogLocaleShort(loc)}
                        </button>
                      ))}
                    </div>
                  )}

                  {block.type === "heading" && (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <select
                          value={block.level || 2}
                          onChange={(e) =>
                            updateBlock(block.id, { level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })
                          }
                          className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6].map((level) => (
                            <option key={level} value={level}>
                              H{level}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateBlock(block.id, {
                                style: { ...block.style, textAlign: "left" },
                              })
                            }
                            className={`p-1 rounded ${block.style?.textAlign === "left" ? "bg-gray-200" : ""}`}
                            title="Align left"
                          >
                            <AlignLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateBlock(block.id, {
                                style: { ...block.style, textAlign: "center" },
                              })
                            }
                            className={`p-1 rounded ${block.style?.textAlign === "center" ? "bg-gray-200" : ""}`}
                            title="Align center"
                          >
                            <AlignCenter className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateBlock(block.id, {
                                style: { ...block.style, textAlign: "right" },
                              })
                            }
                            className={`p-1 rounded ${block.style?.textAlign === "right" ? "bg-gray-200" : ""}`}
                            title="Align right"
                          >
                            <AlignRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={currentContent}
                        onChange={(e) => setBlockContent(block.id, blockLocale, e.target.value)}
                        placeholder={getBlogBlockTextPlaceholder(blockLocale, "heading")}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                        style={{
                          fontSize:
                            block.level === 1
                              ? "2rem"
                              : block.level === 2
                              ? "1.5rem"
                              : block.level === 3
                              ? "1.25rem"
                              : "1rem",
                          fontWeight: "bold",
                          textAlign: block.style?.textAlign || "left",
                        }}
                      />
                    </div>
                  )}

                  {block.type === "paragraph" && (
                    <div>
                      {/* Rich Text Formatting Toolbar */}
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
                          <button
                            onClick={() => {
                              const textarea = document.getElementById(`paragraph-${block.id}`) as HTMLTextAreaElement;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = currentContent.substring(start, end);
                                const newText = currentContent.substring(0, start) + `**${selectedText}**` + currentContent.substring(end);
                                setBlockContent(block.id, blockLocale, newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 2, end + 2);
                                }, 0);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                            title="Bold (**text**)"
                          >
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const textarea = document.getElementById(`paragraph-${block.id}`) as HTMLTextAreaElement;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = currentContent.substring(start, end);
                                const newText = currentContent.substring(0, start) + `*${selectedText}*` + currentContent.substring(end);
                                setBlockContent(block.id, blockLocale, newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 1, end + 1);
                                }, 0);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                            title="Italic (*text*)"
                          >
                            <Italic className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const url = prompt("Enter URL:");
                              if (url) {
                                const textarea = document.getElementById(`paragraph-${block.id}`) as HTMLTextAreaElement;
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = currentContent.substring(start, end) || "link text";
                                  const newText = currentContent.substring(0, start) + `[${selectedText}](${url})` + currentContent.substring(end);
                                  setBlockContent(block.id, blockLocale, newText);
                                  setTimeout(() => {
                                    textarea.focus();
                                    textarea.setSelectionRange(start + selectedText.length + 3, start + selectedText.length + 3 + url.length);
                                  }, 0);
                                }
                              }
                            }}
                            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                            title="Add Link ([text](url))"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            updateBlock(block.id, {
                              style: { ...block.style, textAlign: "left" },
                            })
                          }
                          className={`p-1.5 rounded ${block.style?.textAlign === "left" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                          title="Align left"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateBlock(block.id, {
                              style: { ...block.style, textAlign: "center" },
                            })
                          }
                          className={`p-1.5 rounded ${block.style?.textAlign === "center" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                          title="Align center"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateBlock(block.id, {
                              style: { ...block.style, textAlign: "right" },
                            })
                          }
                          className={`p-1.5 rounded ${block.style?.textAlign === "right" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                          title="Align right"
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        id={`paragraph-${block.id}`}
                        value={currentContent}
                        onChange={(e) => setBlockContent(block.id, blockLocale, e.target.value)}
                        placeholder={getBlogBlockTextPlaceholder(blockLocale, "paragraph")}
                        rows={4}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none font-mono text-sm"
                        style={{ textAlign: block.style?.textAlign || "left" }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatting: <strong>**bold**</strong>, <em>*italic*</em>, <span className="text-gray-600">[link text](url)</span>
                      </p>
                    </div>
                  )}

                  {block.type === "image" && (
                    <div>
                      {/* Language Tabs for Image Alt Text */}
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Alt Text Language:</span>
                        {publishedLocales.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => setBlockLocale(loc)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                              blockLocale === loc
                                ? "bg-[#2563eb] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {getBlogLocaleShort(loc)}
                          </button>
                        ))}
                      </div>
                      
                      {block.imageUrl ? (
                        <div className="space-y-3">
                          <img
                            src={getImageDisplayUrl(block.imageUrl) || block.imageUrl}
                            alt={typeof block.imageAlt === 'string' ? block.imageAlt : (block.imageAlt?.[blockLocale] || "Blog image")}
                            className="max-w-full h-auto rounded-lg border border-gray-300"
                            style={{
                              width:
                                block.imageWidth === "full"
                                  ? "100%"
                                  : block.imageWidth === "half"
                                  ? "50%"
                                  : block.imageWidth === "third"
                                  ? "33.333%"
                                  : block.imageWidth === "quarter"
                                  ? "25%"
                                  : "100%",
                              margin:
                                block.imageAlign === "center"
                                  ? "0 auto"
                                  : block.imageAlign === "right"
                                  ? "0 0 0 auto"
                                  : "0",
                            }}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                              <select
                                value={block.imageWidth || "full"}
                                onChange={(e) =>
                                  updateBlock(block.id, {
                                    imageWidth: e.target.value as "full" | "half" | "third" | "quarter",
                                  })
                                }
                                className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                              >
                                <option value="full">Full Width</option>
                                <option value="half">Half Width</option>
                                <option value="third">Third Width</option>
                                <option value="quarter">Quarter Width</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
                              <select
                                value={block.imageAlign || "left"}
                                onChange={(e) =>
                                  updateBlock(block.id, {
                                    imageAlign: e.target.value as "left" | "center" | "right",
                                  })
                                }
                                className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={typeof block.imageAlt === 'string' ? block.imageAlt : (block.imageAlt?.[blockLocale] || "")}
                            onChange={(e) => {
                              const newAlt = typeof block.imageAlt === 'string' 
                                ? {
                                    ...emptyLocaleTextMap(),
                                    en: block.imageAlt,
                                    [blockLocale]: e.target.value,
                                  }
                                : { ...(block.imageAlt || { en: "", ca: "", uk: "", es: "", fr: "" }), [blockLocale]: e.target.value };
                              updateBlock(block.id, { imageAlt: newAlt });
                            }}
                            placeholder={`Image alt text (${getBlogLocaleLabel(blockLocale)})`}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all cursor-pointer text-sm">
                              <Upload className="w-4 h-4" />
                              <span>{isUploading ? "Uploading..." : "Change Image"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      await handleImageBlockUpload(block.id, file);
                                    } catch {
                                      alert("Failed to upload image. Please try again.");
                                    }
                                  }
                                }}
                                className="hidden"
                                disabled={isUploading}
                              />
                            </label>
                            <button
                              onClick={() => {
                                const url = block.imageUrl;
                                if (url && imagePreviewUrls[url]) {
                                  URL.revokeObjectURL(imagePreviewUrls[url]);
                                }
                                updateBlock(block.id, { imageUrl: undefined });
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-sm font-medium"
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                          {isUploading ? (
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">Click to upload image</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  await handleImageBlockUpload(block.id, file);
                                } catch {
                                  alert("Failed to upload image. Please try again.");
                                }
                              }
                            }}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {block.type === "quote" && (
                    <div>
                      <textarea
                        value={currentContent}
                        onChange={(e) => setBlockContent(block.id, blockLocale, e.target.value)}
                        placeholder={getBlogBlockTextPlaceholder(blockLocale, "quote")}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 border-l-4 border-gray-400 rounded-lg text-gray-900 italic focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      />
                    </div>
                  )}

                  {block.type === "list" && (
                    <div>
                      {(() => {
                        let items: string[] = [];
                        if (Array.isArray(block.listItems)) {
                          items = block.listItems;
                        } else if (block.listItems && typeof block.listItems === "object") {
                          items = block.listItems[blockLocale] || [];
                        }

                        return items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500">•</span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                let currentItems: string[] = [];
                                if (Array.isArray(block.listItems)) {
                                  currentItems = [...block.listItems];
                                } else {
                                  currentItems = [...(block.listItems?.[blockLocale] || [])];
                                }
                                const newItems = [...currentItems];
                                newItems[itemIndex] = e.target.value;

                                if (Array.isArray(block.listItems)) {
                                  const base = [...block.listItems];
                                  const migrated = emptyLocaleListMap();
                                  for (const loc of Object.keys(migrated) as BlogLocale[]) {
                                    migrated[loc] = blockLocale === loc ? newItems : [...base];
                                  }
                                  updateBlock(block.id, { listItems: migrated });
                                } else {
                                  updateBlock(block.id, {
                                    listItems: {
                                      ...emptyLocaleListMap(),
                                      ...(block.listItems as Record<BlogLocale, string[]>),
                                      [blockLocale]: newItems,
                                    },
                                  });
                                }
                              }}
                              placeholder={getBlogBlockTextPlaceholder(blockLocale, "list")}
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <button
                              onClick={() => {
                                let currentItems: string[] = [];
                                if (Array.isArray(block.listItems)) {
                                  currentItems = [...block.listItems];
                                } else {
                                  currentItems = [...(block.listItems?.[blockLocale] || [])];
                                }
                                const newItems = currentItems.filter((_, i) => i !== itemIndex);

                                if (Array.isArray(block.listItems)) {
                                  const base = block.listItems.filter((_, i) => i !== itemIndex);
                                  const migrated = emptyLocaleListMap();
                                  for (const loc of Object.keys(migrated) as BlogLocale[]) {
                                    migrated[loc] = blockLocale === loc ? newItems : [...base];
                                  }
                                  updateBlock(block.id, { listItems: migrated });
                                } else {
                                  updateBlock(block.id, {
                                    listItems: {
                                      ...emptyLocaleListMap(),
                                      ...(block.listItems as Record<BlogLocale, string[]>),
                                      [blockLocale]: newItems,
                                    },
                                  });
                                }
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ));
                      })()}
                      <button
                        onClick={() => {
                          let currentItems: string[] = [];
                          if (Array.isArray(block.listItems)) {
                            currentItems = [...block.listItems];
                          } else {
                            currentItems = [...(block.listItems?.[blockLocale] || [])];
                          }
                          const next = [...currentItems, ""];

                          if (Array.isArray(block.listItems)) {
                            const base = [...block.listItems, ""];
                            const migrated = emptyLocaleListMap();
                            for (const loc of Object.keys(migrated) as BlogLocale[]) {
                              migrated[loc] = blockLocale === loc ? next : [...base];
                            }
                            updateBlock(block.id, { listItems: migrated });
                          } else {
                            updateBlock(block.id, {
                              listItems: {
                                ...emptyLocaleListMap(),
                                ...(block.listItems as Record<BlogLocale, string[]>),
                                [blockLocale]: next,
                              },
                            });
                          }
                        }}
                        className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        + Add Item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500">Remember to save your changes before leaving</p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "success" ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved</span>
              </>
            ) : saveStatus === "error" ? (
              <>
                <X className="w-4 h-4" />
                <span>Error</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Blog</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

