import type { Metadata, Viewport } from "next";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist_Mono } from "next/font/google";
import React from "react";
import { CONTACT } from "@/lib/contact";
import { BASE_URL } from "@/lib/constants";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "pt-BR")) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "hero" });

  const role = `${t("roleStrong")} ${t("roleThin")}`;
  const title = `Lucas Avila — ${role}`;
  const description = t("metaDescription");

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: "%s | Lucas Avila",
    },
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        "pt-BR": `${BASE_URL}/pt-BR`,
        "x-default": `${BASE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/${locale}`,
      siteName: "Lucas Avila",
      title,
      description,
      locale: locale === "pt-BR" ? "pt_BR" : "en_US",
      alternateLocale: locale === "pt-BR" ? ["en_US"] : ["pt_BR"],
      images: [`${BASE_URL}/${locale}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/${locale}/twitter-image`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "pt-BR")) notFound();

  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "hero" }),
  ]);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Lucas Avila",
    jobTitle: `${t("roleStrong")} ${t("roleThin")}`,
    description: t("metaDescription"),
    url: BASE_URL,
    email: CONTACT.email,
    knowsLanguage: ["pt-BR", "en"],
    knowsAbout: ["Python", "FastAPI", "PostgreSQL", "Next.js", "TypeScript", "Docker"],
    sameAs: [CONTACT.githubUrl, CONTACT.linkedinUrl],
  };

  return (
    <html lang={locale} className={`dark ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
