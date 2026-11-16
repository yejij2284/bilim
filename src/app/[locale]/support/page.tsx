import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FaqAccordion } from "@/components/support/FaqAccordion";

export default async function SupportPage({
  params,
}: PageProps<"/[locale]/support">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");

  return (
    <>
      <section className="bg-mist">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-ink text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-ink-soft mt-3 max-w-2xl">{t("intro")}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="section-title mb-8">{t("faqTitle")}</h2>
            <FaqAccordion />
          </div>

          <aside className="space-y-5 lg:pt-16">
            <div className="card">
              <h2 className="text-ink text-lg font-bold">{t("qnaTitle")}</h2>
              <p className="text-ink-soft mt-2 text-[15px]">{t("qnaIntro")}</p>
              <Link href="/support/qna" className="btn btn-primary mt-5 w-full">
                {t("qnaGo")}
              </Link>
            </div>
            <div className="card bg-mist">
              <h2 className="text-ink text-lg font-bold">
                {t("inquiryTitle")}
              </h2>
              <p className="text-ink-soft mt-2 text-[15px]">
                {t("inquiryIntro")}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
