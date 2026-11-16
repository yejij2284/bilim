import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mascot } from "@/components/brand/Mascot";
import { AdSlot } from "@/components/ui/AdSlot";
import { PackageList } from "@/components/rent/PackageList";

// 패키지 가격은 DB에서 읽으므로 요청마다 새로 그린다.
export const dynamic = "force-dynamic";

const STEPS = ["source", "refurbish", "rent"] as const;
const BENEFITS = ["subscription", "pickup", "multilingual"] as const;

const BENEFIT_ICONS: Record<(typeof BENEFITS)[number], React.ReactNode> = {
  subscription: (
    <path d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9zM4 10h16M8 15h3" />
  ),
  pickup: (
    <path d="M3 7h10v9H3V7zm10 3h4l3 3v3h-7v-6zM7 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  ),
  multilingual: (
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.600 12 3z" />
  ),
};

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      {/* 첫 화면 */}
      <section className="bg-forest text-white">
        <div className="container-page grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">
              {t("hero.eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {t("hero.body")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/rent" className="btn btn-light px-8">
                {t("hero.rent")}
              </Link>
              <Link href="/sell" className="btn btn-outline-light px-8">
                {t("hero.sell")}
              </Link>
            </div>
          </div>
          <div className="hidden justify-center lg:flex" aria-hidden="true">
            <div className="flex h-72 w-72 items-center justify-center rounded-[3rem] bg-white/10">
              <Mascot className="h-44 w-44 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* 이용 방법 3단계 */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow">{t("steps.eyebrow")}</p>
          <h2 className="section-title">{t("steps.title")}</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step} className="card">
                <span className="bg-forest inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-ink mt-5 text-lg font-bold">
                  {t(`steps.items.${step}.title`)}
                </h3>
                <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
                  {t(`steps.items.${step}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 핵심 장점 */}
      <section className="section bg-mist">
        <div className="container-page">
          <p className="eyebrow">{t("benefits.eyebrow")}</p>
          <h2 className="section-title">{t("benefits.title")}</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {BENEFITS.map((key) => (
              <li key={key} className="card">
                <span className="bg-mist-deep text-forest inline-flex h-12 w-12 items-center justify-center rounded-2xl">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {BENEFIT_ICONS[key]}
                  </svg>
                </span>
                <h3 className="text-ink mt-5 text-lg font-bold">
                  {t(`benefits.items.${key}.title`)}
                </h3>
                <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
                  {t(`benefits.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 패키지 홍보 */}
      <section className="section">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">{t("packages.eyebrow")}</p>
              <h2 className="section-title">{t("packages.title")}</h2>
              <p className="text-ink-soft mt-2">{t("packages.body")}</p>
            </div>
            <Link href="/rent#packages" className="btn btn-secondary">
              {t("packages.cta")}
            </Link>
          </div>
          <div className="mt-10">
            <PackageList />
          </div>
        </div>
      </section>

      {/* 광고 자리 */}
      <section className="pb-16 sm:pb-24">
        <div className="container-page">
          <AdSlot />
        </div>
      </section>

      {/* 마무리 */}
      <section className="bg-mist-deep">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-ink text-2xl font-bold">
              {t("closing.title")}
            </h2>
            <p className="text-ink-soft mt-2">{t("closing.body")}</p>
          </div>
          <Link href="/apply" className="btn btn-primary px-8">
            {t("closing.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
