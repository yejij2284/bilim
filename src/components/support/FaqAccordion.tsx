import { getTranslations } from "next-intl/server";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/lib/faq";

/** 카테고리별 FAQ 아코디언. <details>를 써서 키보드와 화면 낭독기에서도 그대로 동작한다. */
export async function FaqAccordion() {
  const t = await getTranslations("faq");

  return (
    <div className="space-y-10">
      {FAQ_CATEGORIES.map((category) => (
        <section key={category} aria-labelledby={`faq-${category}`}>
          <h3
            id={`faq-${category}`}
            className="text-forest mb-3 text-lg font-bold"
          >
            {t(`categories.${category}`)}
          </h3>
          <div className="space-y-2">
            {FAQ_ITEMS[category].map((n) => (
              <details
                key={n}
                className="group border-line open:border-sage rounded-2xl border bg-white"
              >
                <summary className="text-ink flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                  {t(`items.${category}.${n}.q`)}
                  <svg
                    viewBox="0 0 20 20"
                    className="text-sage h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 7.5l5 5 5-5" />
                  </svg>
                </summary>
                <p className="text-ink-soft px-5 pb-5 text-[15px] leading-relaxed">
                  {t(`items.${category}.${n}.a`)}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
