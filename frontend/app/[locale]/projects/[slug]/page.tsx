import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Navbar } from "@/components/navbar";
import { Pill } from "@/components/ui/pill";
import { buttonVariants } from "@/components/ui/button-variants";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAllProjects, getProjectBySlug } from "@/lib/api";
import { cn, gradientIndexForSlug } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";

type ProjectPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function ProjectNarrative({ content }: { content: string }) {
  return (
    <div className="max-w-[620px] space-y-5 text-[14px] leading-[1.9] text-text-mute [&_strong]:text-text [&_strong]:font-semibold">
      {content.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph}>{renderInlineMarkdown(paragraph.trim())}</p>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const projects = await getAllProjects();
    return routing.locales.flatMap((locale) =>
      projects.map((project) => ({ locale, slug: project.slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const title = locale === "pt-BR" ? project.title_pt : project.title_en;
  const description =
    locale === "pt-BR" ? project.short_description_pt : project.short_description_en;
  const canonical = `${BASE_URL}/${locale}/projects/${slug}`;
  const ogImage = `${BASE_URL}/${locale}/opengraph-image`;
  const twitterImage = `${BASE_URL}/${locale}/twitter-image`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${BASE_URL}/en/projects/${slug}`,
        "pt-BR": `${BASE_URL}/pt-BR/projects/${slug}`,
        "x-default": `${BASE_URL}/en/projects/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "Lucas Avila",
      title,
      description,
      locale: locale === "pt-BR" ? "pt_BR" : "en_US",
      alternateLocale: locale === "pt-BR" ? ["en_US"] : ["pt_BR"],
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  const [project, t, tNav] = await Promise.all([
    getProjectBySlug(slug),
    getTranslations("projects"),
    getTranslations("nav"),
  ]);

  if (!project) {
    notFound();
  }

  const title = locale === "pt-BR" ? project.title_pt : project.title_en;
  const description =
    locale === "pt-BR" ? project.short_description_pt : project.short_description_en;
  const narrative =
    (locale === "pt-BR" ? project.long_description_pt : project.long_description_en) ?? description;
  const thumbClass = `project-thumb-${gradientIndexForSlug(project.slug)}`;
  const canonical = `${BASE_URL}/${locale}/projects/${slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tNav("home"),
        item: `${BASE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tNav("projects"),
        item: `${BASE_URL}/${locale}#projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: canonical,
      },
    ],
  };

  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url: canonical,
    author: {
      "@type": "Person",
      name: "Lucas Avila",
      url: BASE_URL,
    },
    inLanguage: locale === "pt-BR" ? "pt-BR" : "en",
    keywords: project.tech_stack.join(", "),
    dateCreated: project.create_date,
    dateModified: project.write_date,
    ...(project.repo_url && { codeRepository: project.repo_url }),
    ...(project.live_url && { mainEntityOfPage: project.live_url }),
  };

  return (
    <div className="mx-auto max-w-[780px] bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }}
      />
      <Navbar />
      <main>
        <section className="mx-auto max-w-[780px] px-6 sm:px-10 py-[52px]">
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-[11px] text-text-faint tracking-[0.06em]"
          >
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-text-soft transition-colors">
                  {tNav("home")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-text-ghost">
                /
              </li>
              <li>
                <Link href="/#projects" className="hover:text-text-soft transition-colors">
                  {tNav("projects")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-text-ghost">
                /
              </li>
              <li aria-current="page" className="text-text-soft truncate max-w-[220px]">
                {title}
              </li>
            </ol>
          </nav>

          <header className="mt-8">
            <div className="flex items-center gap-2 mb-[10px]">
              <span className="font-mono text-[10px] tracking-[0.1em] text-accent">/ PROJECT</span>
              <span className="text-[10px] tracking-[0.14em] uppercase text-text-faint">
                {project.status}
              </span>
            </div>
            <h1 className="text-[26px] font-bold tracking-normal text-text mb-7">{title}</h1>
          </header>

          <div
            className={cn(
              "project-thumb h-[220px] relative flex items-center justify-center rounded-[6px] border border-border-2 mb-7",
              thumbClass
            )}
          >
            <span className="font-mono text-[10px] tracking-[0.1em] text-text-ghost">
              {t("thumbPlaceholder")}
            </span>
            {project.status === "active" && (
              <span className="absolute top-3 right-3 bg-accent-bg border border-accent-border text-accent text-[10px] px-[10px] py-[2px] rounded-[3px] font-mono tracking-[0.06em]">
                {t("liveBadge")}
              </span>
            )}
          </div>

          <p className="max-w-[620px] text-[13px] leading-[1.8] text-text-dim mb-5">
            {description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-8">
            {project.tech_stack.map((tech) => (
              <Pill key={tech}>{tech}</Pill>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5 mb-10">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "amber", size: "xs" }))}
              >
                {t("viewLive")}
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outlineThin", size: "xs" }))}
              >
                {t("architecture")} →
              </a>
            )}
          </div>

          <ProjectNarrative content={narrative} />
        </section>
      </main>
    </div>
  );
}
