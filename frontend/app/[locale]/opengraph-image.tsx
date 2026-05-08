import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const role = `${t("roleStrong")} ${t("roleThin")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0a0a0a",
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#ffffff", lineHeight: 1.1 }}>
          Lucas Avila
        </div>
        <div style={{ fontSize: 32, color: "#a1a1aa", fontWeight: 400 }}>{role}</div>
        <div style={{ fontSize: 22, color: "#71717a", maxWidth: 780, marginTop: 8 }}>
          {t("tagline")}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, color: "#52525b" }}>lucasavila.dev</div>
        <div
          style={{
            fontSize: 18,
            color: "#f59e0b",
            border: "1px solid rgba(245, 158, 11, 0.27)",
            borderRadius: 3,
            padding: "6px 16px",
            backgroundColor: "rgba(245, 158, 11, 0.133)",
          }}
        >
          {t("availableBadge")}
        </div>
      </div>
    </div>,
    size
  );
}
