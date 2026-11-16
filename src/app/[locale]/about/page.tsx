import { getTranslations, setRequestLocale } from "next-intl/server";
import { INSPECTION_ITEMS } from "@/lib/constants";
import { CycleDiagram } from "@/components/about/CycleDiagram";
import { GradeTable } from "@/components/grade/GradeTable";

const SERVICES = ["pickup", "grade", "multilingual", "repair"] as const;

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <section className="bg-mist">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-ink text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("about.title")}
          </h1>
          <p className="text-ink-soft mt-3 max-w-2xl leading-relaxed">
            {t("about.intro")}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="section-title mb-8 text-center">
            {t("about.cycle.title")}
          </h2>
          <CycleDiagram />
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-page">
          <h2 className="section-title mb-8">{t("about.services.title")}</h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {SERVICES.map((key) => (
              <li key={key} className="card">
                <h3 className="text-forest text-lg font-bold">
                  {t(`about.services.${key}.title`)}
                </h3>
                <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
                  {t(`about.services.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title mb-6">{t("about.process.title")}</h2>
            <ol className="space-y-3">
              {INSPECTION_ITEMS.map((item, i) => (
                <li
                  key={item}
                  className="border-line flex items-center gap-4 rounded-2xl border bg-white px-5 py-4"
                >
                  <span className="bg-forest inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-ink text-[15px]">
                    {t(`inspection.${item}`)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="section-title mb-6">{t("grades.tableTitle")}</h2>
            <GradeTable />
          </div>
        </div>
      </section>
    </>
  );
}
