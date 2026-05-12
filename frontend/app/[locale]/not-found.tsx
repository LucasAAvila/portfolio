import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("system");
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[780px] flex-col items-start justify-center gap-4 px-6 sm:px-10">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent">404</p>
      <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-text">
        {t("notFoundTitle")}
      </h1>
      <p className="max-w-[520px] text-[13px] leading-[1.7] text-text-mute">{t("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-2 font-mono border border-border-4 text-text-mute hover:text-text hover:border-accent-border transition-colors px-[14px] py-[6px] text-[11px] tracking-[0.06em]"
      >
        ← {t("notFoundCta")}
      </Link>
    </main>
  );
}
