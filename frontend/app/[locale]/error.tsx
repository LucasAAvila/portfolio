"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("system");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[780px] flex-col items-start justify-center gap-4 px-6 sm:px-10">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-destructive">error</p>
      <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-text">{t("errorTitle")}</h1>
      <p className="max-w-[520px] text-[13px] leading-[1.7] text-text-mute">{t("errorBody")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 font-mono border border-border-4 text-text-mute hover:text-text hover:border-accent-border transition-colors px-[14px] py-[6px] text-[11px] tracking-[0.06em]"
      >
        {t("errorRetry")}
      </button>
    </main>
  );
}
