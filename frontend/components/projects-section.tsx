import { getFeaturedProjects } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import { ProjectCard } from "./project-card";
import { SectionHeader } from "./ui/section-header";

interface Props {
  locale: string;
}

export async function ProjectsSection({ locale }: Props) {
  const [projects, t] = await Promise.all([getFeaturedProjects(), getTranslations("projects")]);

  return (
    <section id="projects" className="mx-auto max-w-[780px] px-6 sm:px-10 py-[52px]">
      <SectionHeader slash={t("title")} title={t("workThatShips")} />

      <div className="flex flex-col gap-5">
        {projects.map((p) => (
          <ProjectCard
            key={p.slug}
            slug={p.slug}
            title={locale === "pt-BR" ? p.title_pt : p.title_en}
            description={locale === "pt-BR" ? p.short_description_pt : p.short_description_en}
            techStack={p.tech_stack}
            liveUrl={p.live_url}
            repoUrl={p.repo_url}
            status={p.status}
          />
        ))}
      </div>
    </section>
  );
}
