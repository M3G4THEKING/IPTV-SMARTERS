"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  OFFICIAL_IBO_PLAYER_URL,
  OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL,
} from "@/lib/constants/official-player-links";

type DefaultHeroDescriptionProps = {
  className?: string;
  getText?: (key: string) => string;
};

/**
 * Single flowing paragraph — avoids the large gap caused by splitting across two <p> tags.
 */
export function DefaultHeroDescription({
  className = "text-sm sm:text-base text-[#1a1a1a]/80 leading-relaxed text-left",
  getText,
}: DefaultHeroDescriptionProps) {
  const { t } = useLanguage();
  const text = (key: string) => (getText ? getText(key) : t(key));

  return (
    <p className={className}>
      {text("hero.description")}{" "}
      <a href="#pricing" className="text-[#2563eb] hover:underline font-medium">
        {text("hero.channelsLink")}
      </a>
      {text("hero.description2")}{" "}
      <span className="font-medium text-[#1a1a1a]/90">
        <a
          href={OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563eb] hover:underline"
        >
          {text("hero.officialSmartersLinkText")}
        </a>
        {", "}
        <a
          href={OFFICIAL_IBO_PLAYER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563eb] hover:underline"
        >
          {text("hero.officialIboLinkText")}
        </a>
      </span>
      {text("hero.description3")}{" "}
      <a href="#features" className="text-[#2563eb] hover:underline font-medium">
        {text("hero.m3uLink")}
      </a>
      {text("hero.description4")}{" "}
      <span className="font-semibold text-[#1a1a1a]">{text("hero.freeTest")}</span>{" "}
      {text("hero.description5")}
    </p>
  );
}
