import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("system");
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[60vh] max-w-[780px] items-center justify-center px-6 sm:px-10"
    >
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-text-faint">
        {t("loading")}
      </p>
    </div>
  );
}
