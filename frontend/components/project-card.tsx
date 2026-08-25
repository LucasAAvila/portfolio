import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Pill } from "./ui/pill";
import { buttonVariants } from "./ui/button-variants";
import { cn, gradientIndexForSlug } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/api";

interface ProjectCardProps {
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  imageUrl: string | null;
  status: ProjectStatus;
  slug: string;
}

export async function ProjectCard({
  title,
  description,
  techStack,
  liveUrl,
  repoUrl,
  imageUrl,
  status,
  slug,
}: ProjectCardProps) {
  const t = await getTranslations("projects");
  const thumbClass = `project-thumb-${gradientIndexForSlug(slug)}`;

  return (
    <div className="border border-border-2 rounded-[6px] overflow-hidden">
      <div
        className={cn(
          "project-thumb h-[160px] relative flex items-center justify-center",
          !imageUrl && thumbClass
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <span className="font-mono text-[10px] tracking-[0.1em] text-text-ghost">
            {t("thumbPlaceholder")}
          </span>
        )}
        {status === "active" && (
          <span className="absolute top-3 right-3 bg-accent-bg border border-accent-border text-accent text-[10px] px-[10px] py-[2px] rounded-[3px] font-mono tracking-[0.06em] z-10">
            {t("liveBadge")}
          </span>
        )}
      </div>

      <div className="px-[22px] py-5">
        <Link
          href={`/projects/${slug}`}
          className="block text-[16px] font-bold text-text mb-1.5 hover:text-accent transition-colors"
        >
          {title}
        </Link>
        <p className="text-[12px] text-text-dim leading-[1.7] mb-3.5">{description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {techStack.slice(0, 6).map((tech) => (
            <Pill key={tech}>{tech}</Pill>
          ))}
        </div>

        <div className="flex gap-2.5">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "amber", size: "xs" }))}
            >
              {t("viewLive")}
            </a>
          )}
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outlineThin", size: "xs" }))}
            >
              {t("architecture")} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
