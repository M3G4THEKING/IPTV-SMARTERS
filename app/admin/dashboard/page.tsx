"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Save,
  Loader2,
  Check,
  X,
  Home,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  FileText,
  Edit,
  GripVertical,
  Type,
  Image,
  List,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveUp,
  MoveDown,
  MessageCircle,
} from "lucide-react";
import { translations as defaultTranslations } from "@/lib/i18n";
import BlogsManager from "@/components/admin/BlogsManager";
import DeploymentNotification from "@/components/admin/DeploymentNotification";
import { AdminHeroPreview, AdminPricingPreview } from "@/components/admin/AdminLocalePreview";

interface Translations {
  [locale: string]: {
    content: any;
    sha: string;
    path: string;
  };
}

interface CarouselData {
  channels: string[];
  streaming: string[];
  content: string[];
}

type Section =
  | "hero"
  | "pricing"
  | "whatsapp"
  | "carousel"
  | "reseller"
  | "settings"
  | "blogs"
  | "metadata";

const WHATSAPP_MESSAGE_FIELDS: { key: string; label: string; hint?: string }[] = [
  {
    key: "floatingButton",
    label: "Floating button (corner chat)",
    hint: "Pre-filled when visitors tap the floating WhatsApp icon.",
  },
  {
    key: "defaultButton",
    label: "Default WhatsApp button",
  },
  {
    key: "ctaSection",
    label: "CTA section button",
  },
  {
    key: "homePage",
    label: "Homepage channels CTA",
  },
  {
    key: "pricingPlan",
    label: "Pricing card “Buy now”",
    hint: "Use {planName} where the plan title should appear.",
  },
  {
    key: "contactQuestion",
    label: "Footer / contact question",
  },
  {
    key: "installationHelp",
    label: "Installation pages help",
  },
  {
    key: "resellerInterest",
    label: "Reseller program",
  },
  {
    key: "notFoundHelp",
    label: "404 page",
  },
  {
    key: "tooltip",
    label: "Floating button tooltip",
  },
  {
    key: "contactButton",
    label: "Installation “Contact” link text",
  },
  {
    key: "ariaFloating",
    label: "Accessibility label (floating button)",
  },
  {
    key: "ariaFreeTest",
    label: "Accessibility label (free test button)",
  },
];

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  ca: "Canada",
};

const ADMIN_LOCALE_ORDER = ["en", "es", "fr", "ca"] as const;

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState<Translations>({});
  const [carouselData, setCarouselData] = useState<CarouselData>({ channels: [], streaming: [], content: [] });
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  // Managed links removed (clients requested no outbound link editing)
  const [activeLocale, setActiveLocale] = useState("en");
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [activeCarouselTab, setActiveCarouselTab] = useState<"channels" | "streaming" | "content">("channels");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showPreview, setShowPreview] = useState(false);
  const [showDeploymentNotification, setShowDeploymentNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (activeLocale === "ca") {
      setShowPreview(true);
    }
  }, [activeLocale]);

  // Verify authentication
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/admin/verify");
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/admin/login");
          return;
        }

        setIsAuthenticated(true);
        await Promise.all([loadTranslations(), loadCarouselData(), loadMetadata()]);
      } catch (error) {
        console.error("Auth verification failed:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  // Load translations
  const loadTranslations = async () => {
    try {
      const response = await fetch("/api/admin/translations");
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error("Failed to load translations:", error);
    }
  };

  // Load carousel data
  const loadCarouselData = async () => {
    try {
      const response = await fetch("/api/admin/carousel");
      const data = await response.json();
      setCarouselData(data);
    } catch (error) {
      console.error("Failed to load carousel data:", error);
    }
  };

  // Load metadata
  const loadMetadata = async () => {
    try {
      const response = await fetch("/api/admin/metadata");
      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  };

  // (removed) loadManagedLinks

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Save translations
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/admin/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: activeLocale,
          content: translations[activeLocale].content,
          sha: translations[activeLocale].sha,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save translations");
      }

      setSaveStatus("success");
      setShowDeploymentNotification(true);
      await loadTranslations();
      
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Save metadata
  const handleSaveMetadata = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/admin/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: activeLocale,
          content: metadata[activeLocale]?.content || {},
          sha: metadata[activeLocale]?.sha || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save metadata");
      }

      setSaveStatus("success");
      setShowDeploymentNotification(true);
      await loadMetadata();
      
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // (removed) handleSaveLinks

  // Upload image
  const handleImageUpload = async (file: File, folder: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Add carousel image
  const addCarouselImage = async (file: File) => {
    try {
      const folderMap = {
        channels: "carouselle-channels",
        streaming: "carouselle-streaming",
        content: "carouselle-shows",
      };
      
      const url = await handleImageUpload(file, folderMap[activeCarouselTab]);
      
      setCarouselData(prev => ({
        ...prev,
        [activeCarouselTab]: [...prev[activeCarouselTab], url],
      }));
    } catch (error) {
      console.error("Failed to add carousel image:", error);
    }
  };

  // Remove carousel image
  const removeCarouselImage = (index: number) => {
    setCarouselData(prev => ({
      ...prev,
      [activeCarouselTab]: prev[activeCarouselTab].filter((_, i) => i !== index),
    }));
  };

  // Update translation value (string or boolean)
  const updateValue = (path: string, value: string | boolean) => {
    const keys = path.split(".");
    const newTranslations = { ...translations };
    let current: Record<string, unknown> = newTranslations[activeLocale].content as Record<
      string,
      unknown
    >;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    setTranslations(newTranslations);
  };

  const getRawValue = (path: string): unknown => {
    const keys = path.split(".");
    let current: any = translations[activeLocale]?.content;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        let fallback: any = (defaultTranslations as any)[activeLocale];
        for (const k of keys) {
          if (fallback && fallback[k] !== undefined) {
            fallback = fallback[k];
          } else {
            return undefined;
          }
        }
        return fallback;
      }
    }

    return current;
  };

  const getBoolValue = (path: string, defaultValue = true): boolean => {
    const raw = getRawValue(path);
    if (raw === false || raw === "false" || raw === "0") return false;
    if (raw === true || raw === "true" || raw === "1") return true;
    return defaultValue;
  };

  const getDefaultValue = (localeKey: string, path: string): string => {
    const keys = path.split(".");
    // Use static translation JSON shipped with the app as a fallback
    let current: any = (defaultTranslations as any)[localeKey];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return "";
      }
    }

    return String(current);
  };

  const getValue = (path: string): string => {
    const keys = path.split(".");
    let current: any = translations[activeLocale]?.content;
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // If the key isn't present in GitHub-backed translations,
        // fall back to the built-in translation JSON (per locale, then EN)
        return (
          getDefaultValue(activeLocale, path) ||
          getDefaultValue("en", path) ||
          ""
        );
      }
    }
    
    return String(current);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentContent = translations[activeLocale]?.content;
  const pricePlaceholder =
    activeLocale === "ca"
      ? "29 $CA"
      : activeLocale === "en"
        ? "$19.99"
        : "€19.99";
  const premiumPricePlaceholder =
    activeLocale === "ca"
      ? "39 $CA"
      : activeLocale === "en"
        ? "$29.99"
        : "€29.99";
  const sortedLocales = ADMIN_LOCALE_ORDER.filter((code) => translations[code]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-black">Website Editor</h1>
              <p className="text-sm text-gray-500 font-light mt-0.5">Edit content, images, and settings</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {sortedLocales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => setActiveLocale(locale)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeLocale === locale
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {/* Save Button */}
              <button
                onClick={
                  activeSection === "metadata" ? handleSaveMetadata : handleSave
                }
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
                    <span>Save</span>
                  </>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black font-medium rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 p-2">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection("hero")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "hero"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Homepage
                </button>
                <button
                  onClick={() => setActiveSection("pricing")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "pricing"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Pricing
                </button>
                <button
                  onClick={() => setActiveSection("whatsapp")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "whatsapp"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp & CTA
                </button>
                <button
                  onClick={() => setActiveSection("carousel")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "carousel"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Carousels
                </button>
                <button
                  onClick={() => setActiveSection("reseller")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "reseller"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Reseller
                </button>
                <button
                  onClick={() => setActiveSection("blogs")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "blogs"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Blogs
                </button>
                <button
                  onClick={() => setActiveSection("metadata")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "metadata"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Page Metadata
                </button>
                <button
                  onClick={() => setActiveSection("settings")}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3 text-left ${
                    activeSection === "settings"
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
              </nav>
            </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-span-9">
            {currentContent && (
              <>
                {/* Hero Section Editor */}
                {activeSection === "hero" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-2xl font-medium text-black mb-1">
                        {activeLocale === "ca" ? "Canada Homepage Hero" : "Homepage Hero"}
                      </h2>
                      <p className="text-gray-500 text-sm mb-6">
                        {activeLocale === "ca"
                          ? "Edit the /ca/ hero (title, subtitle, lead paragraph, CTA)."
                          : "Edit your homepage hero section"}
                      </p>

                      <div className="space-y-5">
                        {activeLocale === "ca" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Eyebrow (e.g. Canada · Plans in CAD)
                            </label>
                            <input
                              type="text"
                              value={getValue("hero.eyebrow")}
                              onChange={(e) => updateValue("hero.eyebrow", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Main Heading
                          </label>
                          <input
                            type="text"
                            value={getValue("hero.title")}
                            onChange={(e) => updateValue("hero.title", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subtitle Part 1
                            </label>
                            <input
                              type="text"
                              value={getValue("hero.subtitlePart1")}
                              onChange={(e) => updateValue("hero.subtitlePart1", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subtitle Part 2 <span className="text-blue-600">(Highlighted)</span>
                            </label>
                            <input
                              type="text"
                              value={getValue("hero.subtitlePart2")}
                              onChange={(e) => updateValue("hero.subtitlePart2", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        </div>

                        {activeLocale === "ca" ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lead paragraph (start)
                              </label>
                              <textarea
                                value={getValue("hero.lead")}
                                onChange={(e) => updateValue("hero.lead", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                              />
                            </div>
                            {(["lead2", "lead3", "lead4", "lead5"] as const).map((key) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {key}
                                </label>
                                <input
                                  type="text"
                                  value={getValue(`hero.${key}`)}
                                  onChange={(e) => updateValue(`hero.${key}`, e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CTA button
                                </label>
                                <input
                                  type="text"
                                  value={getValue("hero.cta")}
                                  onChange={(e) => updateValue("hero.cta", e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CTA note
                                </label>
                                <input
                                  type="text"
                                  value={getValue("hero.ctaNote")}
                                  onChange={(e) => updateValue("hero.ctaNote", e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={getValue("hero.description")}
                              onChange={(e) => updateValue("hero.description", e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {(showPreview || activeLocale === "ca") && (
                      <AdminHeroPreview locale={activeLocale} getValue={getValue} />
                    )}
                  </div>
                )}

                {/* Pricing Section Editor */}
                {activeSection === "pricing" && (
                  <div className="space-y-6">
                    {/* Section Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-2xl font-medium text-black mb-1">Pricing Section</h2>
                      <p className="text-gray-500 text-sm mb-6">
                        Edit section title, currency, and plan labels
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.title")}
                            onChange={(e) => updateValue("pricing.title", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>

                        {(activeLocale === "ca" || getValue("pricing.subtitle")) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Section subtitle
                            </label>
                            <textarea
                              value={getValue("pricing.subtitle")}
                              onChange={(e) => updateValue("pricing.subtitle", e.target.value)}
                              rows={2}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Currency code (SEO / schema)
                            </label>
                            <input
                              type="text"
                              maxLength={3}
                              placeholder={activeLocale === "ca" ? "CAD" : activeLocale === "en" ? "USD" : "EUR"}
                              value={getValue("pricing.currencyCode")}
                              onChange={(e) =>
                                updateValue("pricing.currencyCode", e.target.value.toUpperCase())
                              }
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              ISO code for structured data. Card prices use the fields below (e.g.{" "}
                              {pricePlaceholder}).
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Standard plans tab label
                            </label>
                            <input
                              type="text"
                              value={
                                getValue("pricing.standardPlansLabel") ||
                                getValue("pricing.oneConnection")
                              }
                              onChange={(e) =>
                                updateValue("pricing.standardPlansLabel", e.target.value)
                              }
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Premium plans tab label
                            </label>
                            <input
                              type="text"
                              value={getValue("pricing.premiumPlansLabel")}
                              onChange={(e) =>
                                updateValue("pricing.premiumPlansLabel", e.target.value)
                              }
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standard Plans - 4 Cards */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-4">
                        {getValue("pricing.standardPlansLabel") || "Standard Plans (1 Connection)"}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        {/* 3 Months Standard */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan3Months")}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 3 Months Plan)"
                              value={getValue("pricing.plan3Months")}
                              onChange={(e) => updateValue("pricing.plan3Months", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <p className="text-xs text-gray-600 mb-1">
                              Shown on cards as: <strong>{getValue("pricing.plan3MonthsPrice") || pricePlaceholder}</strong>
                            </p>
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${pricePlaceholder})`}
                              value={getValue("pricing.plan3MonthsPrice")}
                              onChange={(e) => updateValue("pricing.plan3MonthsPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>✓ {getValue("pricing.instantActivation") || "Instant Activation"}</p>
                              <p>✓ {getValue("pricing.freeUpdates") || "Free Updates"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p className="text-gray-400">+ more shared features below</p>
                            </div>
                          </div>
                        </div>

                        {/* 6 Months Standard */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan6Months")}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 6 Months Plan)"
                              value={getValue("pricing.plan6Months")}
                              onChange={(e) => updateValue("pricing.plan6Months", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${pricePlaceholder})`}
                              value={getValue("pricing.plan6MonthsPrice")}
                              onChange={(e) => updateValue("pricing.plan6MonthsPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>✓ {getValue("pricing.instantActivation") || "Instant Activation"}</p>
                              <p>✓ {getValue("pricing.freeUpdates") || "Free Updates"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p className="text-gray-400">+ more shared features below</p>
                            </div>
                          </div>
                        </div>

                        {/* 12 Months Standard */}
                        <div className="border border-blue-500 rounded-lg p-4 bg-blue-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan12Months")}
                            </h4>
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Popular</span>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 12 Months Plan)"
                              value={getValue("pricing.plan12Months")}
                              onChange={(e) => updateValue("pricing.plan12Months", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${pricePlaceholder})`}
                              value={getValue("pricing.plan12MonthsPrice")}
                              onChange={(e) => updateValue("pricing.plan12MonthsPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>✓ {getValue("pricing.instantActivation") || "Instant Activation"}</p>
                              <p>✓ {getValue("pricing.freeUpdates") || "Free Updates"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p className="text-gray-500">+ more shared features below</p>
                            </div>
                          </div>
                        </div>

                        {/* 24 Months Standard */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan24Months")}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 24 Months Plan)"
                              value={getValue("pricing.plan24Months")}
                              onChange={(e) => updateValue("pricing.plan24Months", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${pricePlaceholder})`}
                              value={getValue("pricing.plan24MonthsPrice")}
                              onChange={(e) => updateValue("pricing.plan24MonthsPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>✓ {getValue("pricing.instantActivation") || "Instant Activation"}</p>
                              <p>✓ {getValue("pricing.freeUpdates") || "Free Updates"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p className="text-gray-400">+ more shared features below</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Plans - 4 Cards */}
                    <div
                      className={`bg-white rounded-xl border p-6 ${
                        getBoolValue("pricing.showPremiumPlans", true)
                          ? "border-gray-200"
                          : "border-amber-200 bg-amber-50/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-black">
                            {getValue("pricing.premiumPlansLabel") ||
                              "Premium Plans (Multiple Connections)"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Multi-connection plans shown below standard plans on the live site.
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                          <span className="text-sm font-medium text-gray-700">Show on website</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={getBoolValue("pricing.showPremiumPlans", true)}
                            onClick={() =>
                              updateValue(
                                "pricing.showPremiumPlans",
                                !getBoolValue("pricing.showPremiumPlans", true)
                              )
                            }
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                              getBoolValue("pricing.showPremiumPlans", true)
                                ? "bg-black"
                                : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                getBoolValue("pricing.showPremiumPlans", true)
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </label>
                      </div>

                      {!getBoolValue("pricing.showPremiumPlans", true) && (
                        <p className="text-sm text-amber-800 mb-4 rounded-lg bg-amber-100/80 px-3 py-2">
                          This section is hidden on the public site. Turn the switch on to display it
                          again.
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                        {/* 3 Months Premium */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan3MonthsPremium")}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 3 Months Premium)"
                              value={getValue("pricing.plan3MonthsPremium")}
                              onChange={(e) => updateValue("pricing.plan3MonthsPremium", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${premiumPricePlaceholder})`}
                              value={getValue("pricing.plan3MonthsPremiumPrice")}
                              onChange={(e) => updateValue("pricing.plan3MonthsPremiumPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>✓ {getValue("pricing.adultContent") || "Adult Content"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p>✓ {getValue("pricing.quality") || "4K & HD Quality"}</p>
                              <p className="text-gray-400">+ more shared features below</p>
                            </div>
                          </div>
                        </div>

                        {/* 6 Months Premium */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan6MonthsPremium")}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 6 Months Premium)"
                              value={getValue("pricing.plan6MonthsPremium")}
                              onChange={(e) => updateValue("pricing.plan6MonthsPremium", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${premiumPricePlaceholder})`}
                              value={getValue("pricing.plan6MonthsPremiumPrice")}
                              onChange={(e) => updateValue("pricing.plan6MonthsPremiumPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>✓ {getValue("pricing.adultContent") || "Adult Content"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p>✓ {getValue("pricing.quality") || "4K & HD Quality"}</p>
                              <p className="text-gray-400">+ more shared features below</p>
                            </div>
                          </div>
                        </div>

                        {/* 12 Months Premium */}
                        <div className="border border-blue-500 rounded-lg p-4 bg-blue-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan12MonthsPremium")}
                            </h4>
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Popular</span>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 12 Months Premium)"
                              value={getValue("pricing.plan12MonthsPremium")}
                              onChange={(e) => updateValue("pricing.plan12MonthsPremium", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${premiumPricePlaceholder})`}
                              value={getValue("pricing.plan12MonthsPremiumPrice")}
                              onChange={(e) => updateValue("pricing.plan12MonthsPremiumPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-700 space-y-1">
                              <p>✓ {getValue("pricing.adultContent") || "Adult Content"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p>✓ {getValue("pricing.freeMonth") || "1 Month FREE Bonus"}</p>
                              <p className="text-gray-500">+ more shared features below</p>
                            </div>
                          </div>
                        </div>

                        {/* 24 Months Premium */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {getValue("pricing.plan24MonthsPremium")}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Plan title (e.g., 24 Months Premium)"
                              value={getValue("pricing.plan24MonthsPremium")}
                              onChange={(e) => updateValue("pricing.plan24MonthsPremium", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              placeholder={`Price (e.g., ${premiumPricePlaceholder})`}
                              value={getValue("pricing.plan24MonthsPremiumPrice")}
                              onChange={(e) => updateValue("pricing.plan24MonthsPremiumPrice", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>✓ {getValue("pricing.adultContent") || "Adult Content"}</p>
                              <p>✓ {getValue("pricing.liveChannels") || "20,000+ Live Channels"}</p>
                              <p>✓ {getValue("pricing.freeMonths") || "3 Months FREE Bonus"}</p>
                              <p className="text-gray-400">+ more shared features below</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shared feature texts used across plans */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-2">Shared Feature Texts</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        These lines appear under all pricing cards. Edit them once and they update everywhere for this language.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instant activation
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.instantActivation")}
                            onChange={(e) => updateValue("pricing.instantActivation", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Free updates
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.freeUpdates")}
                            onChange={(e) => updateValue("pricing.freeUpdates", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Live channels
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.liveChannels")}
                            onChange={(e) => updateValue("pricing.liveChannels", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Movies & series
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.moviesSeries")}
                            onChange={(e) => updateValue("pricing.moviesSeries", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Anti-freezing
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.antiFreezing")}
                            onChange={(e) => updateValue("pricing.antiFreezing", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quality text
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.quality")}
                            onChange={(e) => updateValue("pricing.quality", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Formats
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.formats")}
                            onChange={(e) => updateValue("pricing.formats", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device compatibility
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.compatible")}
                            onChange={(e) => updateValue("pricing.compatible", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adult content (premium)
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.adultContent")}
                            onChange={(e) => updateValue("pricing.adultContent", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Free month (12 months)
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.freeMonth")}
                            onChange={(e) => updateValue("pricing.freeMonth", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Free months (24 months)
                          </label>
                          <input
                            type="text"
                            value={getValue("pricing.freeMonths")}
                            onChange={(e) => updateValue("pricing.freeMonths", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Features Editor */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-1">Plan Features</h3>
                      <p className="text-gray-500 text-sm mb-4">Edit the feature text shown in all cards</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "instantActivation", label: "Instant Activation" },
                          { key: "freeUpdates", label: "Free Updates" },
                          { key: "liveChannels", label: "Live Channels" },
                          { key: "moviesSeries", label: "Movies & Series" },
                          { key: "adultContent", label: "Adult Content (Premium)" },
                          { key: "antiFreezing", label: "Anti-Freezing" },
                          { key: "quality", label: "Quality" },
                          { key: "fastStable", label: "Fast & Stable" },
                          { key: "formats", label: "Formats" },
                          { key: "compatible", label: "Compatible" },
                          { key: "serverAvailable", label: "Server 99.9% Available" },
                          { key: "support", label: "24/7 Support" },
                        ].map((feature) => (
                          <div key={feature.key}>
                            <label className="text-xs text-gray-600 mb-1 block">{feature.label}</label>
                            <input
                              type="text"
                              value={getValue(`pricing.${feature.key}`)}
                              onChange={(e) => updateValue(`pricing.${feature.key}`, e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {(showPreview || activeLocale === "ca") && (
                      <AdminPricingPreview
                        locale={activeLocale}
                        getValue={getValue}
                        getBoolValue={getBoolValue}
                      />
                    )}
                  </div>
                )}

                {/* WhatsApp & CTA messages */}
                {activeSection === "whatsapp" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-2xl font-medium text-black mb-1 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6" />
                        WhatsApp pre-filled messages
                      </h2>
                      <p className="text-gray-500 text-sm mb-6">
                        Each field is sent as the opening message in WhatsApp when that button is
                        clicked on the {LOCALE_LABELS[activeLocale] ?? activeLocale} site.
                      </p>

                      <div className="space-y-5">
                        {WHATSAPP_MESSAGE_FIELDS.map(({ key, label, hint }) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {label}
                            </label>
                            {hint ? (
                              <p className="text-xs text-gray-500 mb-2">{hint}</p>
                            ) : null}
                            <textarea
                              value={getValue(`whatsapp.${key}`)}
                              onChange={(e) => updateValue(`whatsapp.${key}`, e.target.value)}
                              rows={key === "pricingPlan" ? 2 : 3}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-4">CTA section (homepage)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {(["title", "title2", "title3"] as const).map((key) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Title line — {key}
                            </label>
                            <input
                              type="text"
                              value={getValue(`cta.${key}`)}
                              onChange={(e) => updateValue(`cta.${key}`, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={getValue("cta.description")}
                            onChange={(e) => updateValue("cta.description", e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              WhatsApp button label
                            </label>
                            <input
                              type="text"
                              value={getValue("cta.whatsapp")}
                              onChange={(e) => updateValue("cta.whatsapp", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email button label
                            </label>
                            <input
                              type="text"
                              value={getValue("cta.email")}
                              onChange={(e) => updateValue("cta.email", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-4">Contact strip</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading
                          </label>
                          <input
                            type="text"
                            value={getValue("contactSection.title")}
                            onChange={(e) => updateValue("contactSection.title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={getValue("contactSection.description")}
                            onChange={(e) =>
                              updateValue("contactSection.description", e.target.value)
                            }
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Carousel Section Editor */}
                {activeSection === "carousel" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-2xl font-medium text-black mb-1">Carousel Images</h2>
                      <p className="text-gray-500 text-sm mb-6">Manage carousel images - add, remove, or reorder</p>

                      {/* Carousel Type Tabs */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                          onClick={() => setActiveCarouselTab("channels")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                            activeCarouselTab === "channels"
                              ? "bg-white text-black shadow-sm"
                              : "text-gray-600 hover:text-black"
                          }`}
                        >
                          TV Channels ({carouselData.channels?.length || 0})
                        </button>
                        <button
                          onClick={() => setActiveCarouselTab("streaming")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                            activeCarouselTab === "streaming"
                              ? "bg-white text-black shadow-sm"
                              : "text-gray-600 hover:text-black"
                          }`}
                        >
                          Streaming ({carouselData.streaming?.length || 0})
                        </button>
                        <button
                          onClick={() => setActiveCarouselTab("content")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                            activeCarouselTab === "content"
                              ? "bg-white text-black shadow-sm"
                              : "text-gray-600 hover:text-black"
                          }`}
                        >
                          Content/Shows ({carouselData.content?.length || 0})
                        </button>
                      </div>

                      {/* Upload Button */}
                      <div className="mb-6">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-all cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>{isUploading ? "Uploading..." : "Upload New Image"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) addCarouselImage(file);
                            }}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {/* Scrollable Image Grid - All images visible */}
                      <div className="max-h-[600px] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {carouselData[activeCarouselTab]?.map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
                                <img
                                  src={image}
                                  alt={`Carousel ${index + 1}`}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => removeCarouselImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Delete image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                #{index + 1}
                              </div>
                            </div>
                          ))}
                          
                          {/* Add More Placeholder */}
                          <label className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all">
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 text-center px-2">Add Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) addCarouselImage(file);
                              }}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Image Count Info */}
                      <div className="mt-4 text-sm text-gray-500">
                        Total: {carouselData[activeCarouselTab]?.length || 0} images
                      </div>
                    </div>
                  </div>
                )}

                {/* Reseller Section Editor */}
                {activeSection === "reseller" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-2xl font-medium text-black mb-1">Reseller Page</h2>
                      <p className="text-gray-500 text-sm mb-6">Edit your reseller program page</p>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hero Title
                          </label>
                          <textarea
                            value={getValue("reseller.heroTitle")}
                            onChange={(e) => updateValue("reseller.heroTitle", e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-lg font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hero Subtitle
                          </label>
                          <textarea
                            value={getValue("reseller.heroSubtitle")}
                            onChange={(e) => updateValue("reseller.heroSubtitle", e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Call-to-Action Button
                          </label>
                          <input
                            type="text"
                            value={getValue("reseller.heroButton")}
                            onChange={(e) => updateValue("reseller.heroButton", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-4">Reseller credit pricing</h3>
                      {activeLocale === "ca" ? (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency note (optional, above plan cards)
                          </label>
                          <input
                            type="text"
                            value={getValue("reseller.pricingCurrencyNote")}
                            onChange={(e) =>
                              updateValue("reseller.pricingCurrencyNote", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      ) : null}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(
                          [
                            { key: "credit10Price", label: "10 credits" },
                            { key: "credit20Price", label: "20 credits" },
                            { key: "credit30Price", label: "30 credits" },
                          ] as const
                        ).map(({ key, label }) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {label}
                            </label>
                            <input
                              type="text"
                              placeholder={
                                activeLocale === "ca"
                                  ? "$219 CAD"
                                  : activeLocale === "en"
                                    ? "$175"
                                    : "160 €"
                              }
                              value={getValue(`reseller.${key}`)}
                              onChange={(e) => updateValue(`reseller.${key}`, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    {showPreview && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Preview</p>
                        <h1 className="text-3xl font-bold text-black mb-3">{getValue("reseller.heroTitle")}</h1>
                        <p className="text-gray-600 mb-4 leading-relaxed">{getValue("reseller.heroSubtitle")}</p>
                        <button className="px-6 py-3 bg-black text-white rounded-lg font-medium">
                          {getValue("reseller.heroButton")}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Blogs Section Editor */}
                {activeSection === "blogs" && (
                  <BlogsManager />
                )}

                {/* Metadata Section Editor */}
                {activeSection === "metadata" && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Type className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">Page Metadata</h2>
                          <p className="text-sm text-gray-600 mt-0.5">Edit SEO titles and descriptions for all pages</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Homepage */}
                      <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-800">
                          <div className="flex items-center gap-3">
                            <Home className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Homepage</h3>
                            <span className="ml-auto px-2.5 py-1 bg-blue-500/30 text-white text-xs font-medium rounded-full">Main Page</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-5">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              Page Title
                            </label>
                            <input
                              type="text"
                              value={metadata[activeLocale]?.content?.homepage?.title || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  homepage: {
                                    ...newMetadata[activeLocale].content?.homepage,
                                    title: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              placeholder="Enter page title for SEO..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              Meta Description
                            </label>
                            <textarea
                              value={metadata[activeLocale]?.content?.homepage?.description || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  homepage: {
                                    ...newMetadata[activeLocale].content?.homepage,
                                    description: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              rows={4}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                              placeholder="Enter meta description for SEO..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Blog Listing */}
                      <div className="bg-white rounded-xl border-2 border-purple-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 border-b border-purple-800">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Blog Listing Page</h3>
                            <span className="ml-auto px-2.5 py-1 bg-purple-500/30 text-white text-xs font-medium rounded-full">Content</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-5">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                              Page Title
                            </label>
                            <input
                              type="text"
                              value={metadata[activeLocale]?.content?.blogListing?.title || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  blogListing: {
                                    ...newMetadata[activeLocale].content?.blogListing,
                                    title: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                              placeholder="Enter page title for SEO..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                              Meta Description
                            </label>
                            <textarea
                              value={metadata[activeLocale]?.content?.blogListing?.description || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  blogListing: {
                                    ...newMetadata[activeLocale].content?.blogListing,
                                    description: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              rows={4}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                              placeholder="Enter meta description for SEO..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Blog Page */}
                      <div className="bg-white rounded-xl border-2 border-fuchsia-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 px-6 py-4 border-b border-fuchsia-800">
                          <div className="flex items-center gap-3">
                            <Edit className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Blog Page</h3>
                            <span className="ml-auto px-2.5 py-1 bg-fuchsia-500/30 text-white text-xs font-medium rounded-full">SEO</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-5">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-fuchsia-600 rounded-full"></span>
                              Page Title
                            </label>
                            <input
                              type="text"
                              value={metadata[activeLocale]?.content?.blog?.title || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  blog: {
                                    ...newMetadata[activeLocale].content?.blog,
                                    title: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all"
                              placeholder="Enter page title for SEO..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-fuchsia-600 rounded-full"></span>
                              Meta Description
                            </label>
                            <textarea
                              value={metadata[activeLocale]?.content?.blog?.description || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  blog: {
                                    ...newMetadata[activeLocale].content?.blog,
                                    description: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              rows={4}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 resize-none transition-all"
                              placeholder="Enter meta description for SEO..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Installation Pages */}
                      <div className="bg-white rounded-xl border-2 border-green-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 border-b border-green-800">
                          <div className="flex items-center gap-3">
                            <SettingsIcon className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Installation Pages</h3>
                            <span className="ml-auto px-2.5 py-1 bg-green-500/30 text-white text-xs font-medium rounded-full">5 Pages</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {[
                              { key: "windows", label: "Windows Installation", icon: "💻" },
                              { key: "ios", label: "iOS Installation", icon: "📱" },
                              { key: "firestick", label: "Firestick Installation", icon: "📺" },
                              { key: "smartTv", label: "Smart TV Installation", icon: "🖥️" },
                              { key: "guide", label: "Installation Guide", icon: "📖" },
                            ].map((page) => (
                              <div key={page.key} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="text-2xl">{page.icon}</span>
                                  <h4 className="font-semibold text-gray-900">{page.label}</h4>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                                      <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                      Page Title
                                    </label>
                                    <input
                                      type="text"
                                      value={metadata[activeLocale]?.content?.installation?.[page.key]?.title || ""}
                                      onChange={(e) => {
                                        const newMetadata = { ...metadata };
                                        if (!newMetadata[activeLocale]) {
                                          newMetadata[activeLocale] = { content: {}, sha: "" };
                                        }
                                        if (!newMetadata[activeLocale].content.installation) {
                                          newMetadata[activeLocale].content.installation = {};
                                        }
                                        newMetadata[activeLocale].content.installation = {
                                          ...newMetadata[activeLocale].content.installation,
                                          [page.key]: {
                                            ...newMetadata[activeLocale].content.installation[page.key],
                                            title: e.target.value,
                                          },
                                        };
                                        setMetadata(newMetadata);
                                      }}
                                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                      placeholder="Enter page title..."
                                    />
                                  </div>
                                  <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                                      <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                      Meta Description
                                    </label>
                                    <textarea
                                      value={metadata[activeLocale]?.content?.installation?.[page.key]?.description || ""}
                                      onChange={(e) => {
                                        const newMetadata = { ...metadata };
                                        if (!newMetadata[activeLocale]) {
                                          newMetadata[activeLocale] = { content: {}, sha: "" };
                                        }
                                        if (!newMetadata[activeLocale].content.installation) {
                                          newMetadata[activeLocale].content.installation = {};
                                        }
                                        newMetadata[activeLocale].content.installation = {
                                          ...newMetadata[activeLocale].content.installation,
                                          [page.key]: {
                                            ...newMetadata[activeLocale].content.installation[page.key],
                                            description: e.target.value,
                                          },
                                        };
                                        setMetadata(newMetadata);
                                      }}
                                      rows={3}
                                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
                                      placeholder="Enter meta description..."
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Reseller Page */}
                      <div className="bg-white rounded-xl border-2 border-orange-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 border-b border-orange-800">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Reseller Program Page</h3>
                            <span className="ml-auto px-2.5 py-1 bg-orange-500/30 text-white text-xs font-medium rounded-full">Business</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-5">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                              Page Title
                            </label>
                            <input
                              type="text"
                              value={metadata[activeLocale]?.content?.reseller?.title || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  reseller: {
                                    ...newMetadata[activeLocale].content?.reseller,
                                    title: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                              placeholder="Enter page title for SEO..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2.5">
                              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                              Meta Description
                            </label>
                            <textarea
                              value={metadata[activeLocale]?.content?.reseller?.description || ""}
                              onChange={(e) => {
                                const newMetadata = { ...metadata };
                                if (!newMetadata[activeLocale]) {
                                  newMetadata[activeLocale] = { content: {}, sha: "" };
                                }
                                newMetadata[activeLocale].content = {
                                  ...newMetadata[activeLocale].content,
                                  reseller: {
                                    ...newMetadata[activeLocale].content?.reseller,
                                    description: e.target.value,
                                  },
                                };
                                setMetadata(newMetadata);
                              }}
                              rows={4}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
                              placeholder="Enter meta description for SEO..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Legal Pages */}
                      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-900">
                          <div className="flex items-center gap-3">
                            <AlignLeft className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Legal Pages</h3>
                            <span className="ml-auto px-2.5 py-1 bg-white/15 text-white text-xs font-medium rounded-full">3 Pages</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {[
                              { key: "refundPolicy", label: "Refund Policy", accent: "bg-slate-700" },
                              { key: "privacyPolicy", label: "Privacy Policy", accent: "bg-slate-700" },
                              { key: "termsOfService", label: "Terms of Service", accent: "bg-slate-700" },
                            ].map((page) => (
                              <div
                                key={page.key}
                                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-slate-400 transition-all hover:shadow-md"
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <span className={`w-2.5 h-2.5 rounded-full ${page.accent}`} />
                                  <h4 className="font-semibold text-gray-900">{page.label}</h4>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                      Page Title
                                    </label>
                                    <input
                                      type="text"
                                      value={metadata[activeLocale]?.content?.legal?.[page.key]?.title || ""}
                                      onChange={(e) => {
                                        const newMetadata = { ...metadata };
                                        if (!newMetadata[activeLocale]) {
                                          newMetadata[activeLocale] = { content: {}, sha: "" };
                                        }
                                        if (!newMetadata[activeLocale].content.legal) {
                                          newMetadata[activeLocale].content.legal = {};
                                        }
                                        newMetadata[activeLocale].content.legal = {
                                          ...newMetadata[activeLocale].content.legal,
                                          [page.key]: {
                                            ...newMetadata[activeLocale].content.legal[page.key],
                                            title: e.target.value,
                                          },
                                        };
                                        setMetadata(newMetadata);
                                      }}
                                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                                      placeholder="Enter page title..."
                                    />
                                  </div>
                                  <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                      Meta Description
                                    </label>
                                    <textarea
                                      value={metadata[activeLocale]?.content?.legal?.[page.key]?.description || ""}
                                      onChange={(e) => {
                                        const newMetadata = { ...metadata };
                                        if (!newMetadata[activeLocale]) {
                                          newMetadata[activeLocale] = { content: {}, sha: "" };
                                        }
                                        if (!newMetadata[activeLocale].content.legal) {
                                          newMetadata[activeLocale].content.legal = {};
                                        }
                                        newMetadata[activeLocale].content.legal = {
                                          ...newMetadata[activeLocale].content.legal,
                                          [page.key]: {
                                            ...newMetadata[activeLocale].content.legal[page.key],
                                            description: e.target.value,
                                          },
                                        };
                                        setMetadata(newMetadata);
                                      }}
                                      rows={4}
                                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none transition-all"
                                      placeholder="Enter meta description..."
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Section Editor */}
                {activeSection === "settings" && (
                  <div className="space-y-6">
                    {/* Navigation Menu */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-black mb-1">Navigation Menu</h3>
                      <p className="text-gray-500 text-sm mb-4">Edit navigation menu items</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: "home", label: "Home" },
                          { key: "pricing", label: "Pricing" },
                          { key: "features", label: "Features" },
                          { key: "faq", label: "FAQ" },
                          { key: "contact", label: "Contact" },
                          { key: "blog", label: "Blog" },
                          { key: "iptvReseller", label: "IPTV Reseller" },
                        ].map((item) => (
                          <div key={item.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              {item.label}
                            </label>
                            <input
                              type="text"
                              value={getValue(`common.${item.key}`)}
                              onChange={(e) => updateValue(`common.${item.key}`, e.target.value)}
                              placeholder={item.label}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deployment Notification */}
      <DeploymentNotification
        show={showDeploymentNotification}
        onClose={() => setShowDeploymentNotification(false)}
        type={saveStatus === "error" ? "error" : "success"}
      />
    </div>
  );
}
