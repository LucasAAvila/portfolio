"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { key: "projects" as const, href: "#projects" },
  { key: "about" as const, href: "#about" },
  { key: "stack" as const, href: "#stack" },
  { key: "contact" as const, href: "#contact" },
];

export function Navbar() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  function switchLocale() {
    const nextLocale = locale === "en" ? "pt-BR" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  function openMobileMenu() {
    setMobileOpen(true);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  // Move focus into the mobile menu when it opens.
  useEffect(() => {
    if (mobileOpen) {
      firstMobileLinkRef.current?.focus();
    }
  }, [mobileOpen]);

  const nextLocaleLabel = locale === "en" ? "Português" : "English";
  const nextLocaleShort = locale === "en" ? "PT" : "EN";

  return (
    <header className="w-full border-b border-border-1 bg-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-bg focus:text-text focus:text-[12px]"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex max-w-[780px] items-center justify-between px-6 sm:px-10 py-[14px]">
        <a
          href="#hero"
          className="text-[13px] tracking-[0.04em] text-text-soft hover:text-text transition-colors capitalize"
        >
          lucas avila
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-[22px]">
          {NAV_LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="text-[12px] text-text-dimmer hover:text-text transition-colors capitalize"
            >
              {t(key)}
            </a>
          ))}

          <a
            href={`/CV_Lucas_Avila_Backend_${locale}.pdf`}
            download
            className="font-mono border border-border-4 text-text-mute hover:text-text transition-colors px-[14px] py-[3px] text-[11px] tracking-[0.06em] capitalize"
          >
            ↓ {t("cv")}
          </a>

          <button
            onClick={switchLocale}
            aria-label={`Switch to ${nextLocaleLabel}`}
            className="font-mono border border-border-4 text-text-mute hover:text-text transition-colors px-[14px] py-[3px] text-[11px] tracking-[0.06em]"
          >
            {nextLocaleShort}
          </button>
        </nav>

        {/* Mobile: locale switcher + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={switchLocale}
            aria-label={`Switch to ${nextLocaleLabel}`}
            className="font-mono border border-border-4 text-text-mute hover:text-text transition-colors px-[10px] py-[3px] text-[11px] tracking-[0.06em]"
          >
            {nextLocaleShort}
          </button>

          <button
            onClick={mobileOpen ? closeMobileMenu : openMobileMenu}
            className="text-text-mute hover:text-text transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <div
        id="mobile-nav"
        className={`sm:hidden border-t border-border-1 bg-bg ${mobileOpen ? "block" : "hidden"}`}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map(({ key, href }, index) => (
            <a
              key={key}
              href={href}
              ref={index === 0 ? firstMobileLinkRef : undefined}
              onClick={closeMobileMenu}
              className="text-[12px] text-text-dimmer hover:text-text transition-colors capitalize"
            >
              {t(key)}
            </a>
          ))}
          <a
            href={`/CV_Lucas_Avila_Backend_${locale}.pdf`}
            download
            className="font-mono text-[11px] text-text-mute tracking-[0.06em] capitalize"
          >
            ↓ {t("cv")}
          </a>
        </nav>
      </div>
    </header>
  );
}
