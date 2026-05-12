import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TechSection } from "@/components/tech-section";
import { getTranslations } from "next-intl/server";
import { ProjectsSection } from "@/components/projects-section";
import { ProofBar } from "@/components/ui/proof-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { ContactForm } from "@/components/contact-form";
import { CONTACT } from "@/lib/contact";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  const proofItems = [
    { value: t("stats.years"), label: t("stats.yearsLabel") },
    { value: t("stats.fastapi"), label: t("stats.fastapiLabel"), mono: true },
    { value: t("stats.docker"), label: t("stats.dockerLabel"), mono: true },
    { value: t("stats.live"), label: t("stats.liveLabel"), mono: true },
  ];

  return (
    <div className="mx-auto max-w-[780px] bg-bg">
      <Navbar />
      <main id="main-content">
        <Hero />

        <ProofBar items={proofItems} />

        <ProjectsSection locale={locale} />

        <section id="about" className="mx-auto max-w-[780px] px-6 sm:px-10 pb-[52px]">
          <SectionHeader slash={t("about.title")} title={t("about.whoIAm")} />
          <div className="max-w-[560px] text-[14px] leading-[1.9] text-text-mute [&_strong]:text-text [&_strong]:font-semibold [&_p+p]:mt-4">
            {t.rich("about.bio", {
              p: (chunks) => <p>{chunks}</p>,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </div>
        </section>

        <TechSection />

        <section id="contact" className="mx-auto max-w-[780px] px-6 sm:px-10 pb-[52px]">
          <SectionHeader slash={t("contact.title")} title={t("contact.letsTalk")} />
          <p className="text-[12px] text-text-faint tracking-[0.04em] mb-6">
            {t("contact.openTo")}
          </p>
          <address className="not-italic grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="border border-border-1 rounded-[5px] px-4 py-3.5">
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-text-faint mb-1.5">
                {t("contact.emailLabel")}
              </div>
              <div className="text-[12px] text-text-mute">
                <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">
                  {CONTACT.email}
                </a>
              </div>
            </div>
            <div className="border border-border-1 rounded-[5px] px-4 py-3.5">
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-text-faint mb-1.5">
                {t("contact.linkedinLabel")}
              </div>
              <div className="text-[12px] text-text-mute">
                <a
                  href={CONTACT.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {CONTACT.linkedinHandle}
                </a>
              </div>
            </div>
            <div className="border border-border-1 rounded-[5px] px-4 py-3.5">
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-text-faint mb-1.5">
                {t("contact.githubLabel")}
              </div>
              <div className="text-[12px] text-text-mute">
                <a
                  href={CONTACT.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {CONTACT.githubHandle}
                </a>
              </div>
            </div>
          </address>
          <ContactForm />
        </section>
      </main>
      <footer className="border-t border-border-1 py-[14px] px-6 sm:px-10 flex flex-col sm:flex-row justify-between text-[11px] text-text-ghost gap-2">
        <span>{t("footer.brand")}</span>
        <span>{t("footer.role")}</span>
      </footer>
    </div>
  );
}
