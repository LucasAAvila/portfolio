import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getAllProjects, type Project } from "@/lib/api";
import { BASE_URL } from "@/lib/constants";

function localeAlternates(path: string) {
  return {
    languages: {
      en: `${BASE_URL}/en${path}`,
      "pt-BR": `${BASE_URL}/pt-BR${path}`,
      "x-default": `${BASE_URL}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projects: Project[] = [];
  try {
    projects = await getAllProjects();
  } catch {
    // API unreachable at build time (e.g. CI). Fall back to static entries;
    // ISR will refresh the sitemap once the API is back via the "projects" tag.
  }

  const homeEntries: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(Math.max(...projects.map((p) => new Date(p.write_date).getTime()), 0)),
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1.0 : 0.9,
    alternates: localeAlternates(""),
  }));

  const projectEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${BASE_URL}/${locale}/projects/${project.slug}`,
      lastModified: new Date(project.write_date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: localeAlternates(`/projects/${project.slug}`),
    }))
  );

  return [...homeEntries, ...projectEntries];
}
