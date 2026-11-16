import { getTranslations } from "next-intl/server";

/**
 * 광고 자리 표시.
 * TODO: 광고주(통신·송금·어학원·부동산)가 정해지면 실제 배너로 교체한다.
 */
export async function AdSlot() {
  const t = await getTranslations("home.ad");
  return (
    <aside
      aria-label={t("label")}
      className="border-sage bg-mist flex flex-col items-start gap-2 rounded-3xl border border-dashed p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8"
    >
      <span className="border-sage text-sage-text rounded-full border px-3 py-1 text-xs font-semibold">
        {t("label")}
      </span>
      <div>
        <p className="text-ink text-lg font-bold">{t("title")}</p>
        <p className="text-ink-soft mt-1 text-sm">{t("body")}</p>
      </div>
    </aside>
  );
}
