import { buttonVariants } from "@/components/ui/button-variants";
import { CONTACT } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { getLocale, getTranslations } from "next-intl/server";

export async function Hero() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <section id="hero" className="mx-auto max-w-[780px] px-6 sm:px-10 pt-16 pb-[52px]">
      <div className="flex items-center gap-[10px] mb-7">
        <div className="w-7 h-px bg-accent" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent">
          {t("hero.availableBadge")}
        </span>
      </div>

      <h1 className="text-[52px] leading-[1.05] tracking-normal">
        <strong className="block text-text font-extrabold">{t("hero.roleStrong")}</strong>
        <span className="block text-text-dimmer font-extralight">{t("hero.roleThin")}</span>
      </h1>

      <div className="mt-4 text-[13px] leading-[1.8] text-text-dim">
        <em className="not-italic text-text-soft">{t("hero.subtitle")}</em>
        <br />
        {t("hero.tagline")}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href="#projects"
          className={cn(
            buttonVariants({ variant: "amber", size: "lg" }),
            "px-[22px] py-[9px] h-auto text-[13px]"
          )}
        >
          {t("hero.cta")}
        </a>
        <a
          href={`/CV_Lucas_Avila_Backend_${locale}.pdf`}
          download
          className={cn(
            buttonVariants({ variant: "outlineThin", size: "lg" }),
            "px-[22px] py-[9px] h-auto text-[13px]"
          )}
        >
          {t("hero.downloadCv")}
        </a>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <a
          href={CONTACT.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-text-faint tracking-[0.06em] hover:text-text-soft transition-colors"
        >
          github
        </a>
        <span className="text-text-faint/50">·</span>
        <a
          href={CONTACT.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-text-faint tracking-[0.06em] hover:text-text-soft transition-colors"
        >
          linkedin
        </a>
        <span className="text-text-faint/50">·</span>
        <a
          href={`mailto:${CONTACT.email}`}
          className="font-mono text-[11px] text-text-faint tracking-[0.06em] hover:text-text-soft transition-colors"
        >
          email
        </a>
      </div>
    </section>
  );
}
