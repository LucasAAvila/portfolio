import { getAllSkills } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "./ui/section-header";
import { Pill } from "./ui/pill";

export async function TechSection() {
  const [skills, t] = await Promise.all([getAllSkills(), getTranslations()]);

  const categories = [
    { key: "backend", label: t("skills.backend") },
    { key: "frontend", label: t("skills.frontend") },
    { key: "infra", label: t("skills.infra") },
    { key: "databases", label: t("skills.databases") },
  ];

  return (
    <section id="stack" className="mx-auto max-w-[780px] px-6 sm:px-10 pb-[52px]">
      <SectionHeader slash="STACK" title={t("skills.title")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categories.map(({ key, label }) => (
          <div key={key} className="border border-border-1 rounded-[5px] px-[18px] py-4">
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-accent mb-2.5">
              {label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(skills[key] ?? []).map((skill) => (
                <Pill key={skill.id} variant="solid">
                  {skill.name}
                </Pill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
