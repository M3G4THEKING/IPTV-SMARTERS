import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n";
import { siteNameMap } from "@/lib/i18n/locale-maps";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, optimizeImageForSocialShare } from "@/lib/seo/og-image";

export const ogImageSize = {
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
};

export const ogImageContentType = "image/png";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function accentForLocale(locale: Locale): string {
  return "#2563eb";
}

type OgCardProps = {
  title: string;
  description: string;
  locale: Locale;
  badge?: string;
  backgroundImageUrl?: string;
};

export function OgCard({ title, description, locale, badge, backgroundImageUrl }: OgCardProps) {
  const accent = accentForLocale(locale);
  const siteName = siteNameMap[locale];
  const bgUrl = backgroundImageUrl
    ? optimizeImageForSocialShare(backgroundImageUrl)
    : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #0f172a 100%)",
        position: "relative",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {bgUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt=""
            width={OG_IMAGE_WIDTH}
            height={OG_IMAGE_HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.55) 40%, rgba(15,23,42,0.94) 100%)",
            }}
          />
        </>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "flex-end",
          padding: "56px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {badge ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: accent,
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: 8,
              marginBottom: 20,
              letterSpacing: "0.02em",
            }}
          >
            {badge}
          </div>
        ) : null}
        <div style={{ color: "#94a3b8", fontSize: 24, marginBottom: 16, fontWeight: 600 }}>
          {siteName}
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: title.length > 60 ? 48 : 56,
            fontWeight: 800,
            lineHeight: 1.12,
            marginBottom: 20,
            maxWidth: 1050,
            letterSpacing: "-0.02em",
          }}
        >
          {truncate(title, 100)}
        </div>
        <div
          style={{
            color: "#cbd5e1",
            fontSize: 26,
            lineHeight: 1.35,
            maxWidth: 980,
          }}
        >
          {truncate(description, 140)}
        </div>
      </div>
    </div>
  );
}

export function createOgImageResponse(props: OgCardProps): ImageResponse {
  return new ImageResponse(<OgCard {...props} />, {
    ...ogImageSize,
  });
}
