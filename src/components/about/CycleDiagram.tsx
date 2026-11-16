import { getTranslations } from "next-intl/server";

function Node({
  title,
  sub,
  tone = "light",
}: {
  title: string;
  sub: string;
  tone?: "light" | "brand" | "muted";
}) {
  const style =
    tone === "brand"
      ? "bg-forest text-white border-forest"
      : tone === "muted"
        ? "bg-mist-deep text-ink border-sage border-dashed"
        : "bg-white text-ink border-sage";
  return (
    <div className={`rounded-2xl border px-4 py-4 text-center ${style}`}>
      <p className="text-base font-bold">{title}</p>
      <p
        className={`mt-0.5 text-sm ${tone === "brand" ? "text-white/85" : "text-ink-soft"}`}
      >
        {sub}
      </p>
    </div>
  );
}

function Arrow({ label, both = false }: { label: string; both?: boolean }) {
  return (
    <div className="text-sage-text flex flex-col items-center gap-1 py-2">
      <svg
        viewBox="0 0 24 36"
        className="text-sage h-9 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v30M5 26l7 7 7-7" />
        {both && <path d="M5 10l7-7 7 7" />}
      </svg>
      <span className="text-center text-xs font-semibold">{label}</span>
    </div>
  );
}

/**
 * bilim 순환 구조 그림.
 * 출국자·제조사 -> bilim -> 렌탈 고객, 그리고 수리업체.
 * 언어마다 글자 길이가 달라서 SVG 대신 HTML 상자로 그린다.
 */
export async function CycleDiagram() {
  const t = await getTranslations("about.cycle");

  return (
    <figure className="bg-mist mx-auto max-w-2xl rounded-3xl p-5 sm:p-8">
      <div className="grid grid-cols-2 gap-x-4">
        <Node title={t("suppliers")} sub={t("suppliersSub")} />
        <Node title={t("leavers")} sub={t("leaversSub")} />
        <Arrow label={t("flowNew")} />
        <Arrow label={t("flowUsed")} />
      </div>

      <Node title={t("bilim")} sub={t("bilimSub")} tone="brand" />

      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <Arrow label={t("flowRent")} />
          <Node title={t("customers")} sub={t("customersSub")} />
        </div>
        <div>
          <Arrow label={t("flowRepair")} both />
          <Node title={t("repair")} sub={t("repairSub")} tone="muted" />
        </div>
      </div>

      <figcaption className="text-ink-soft mt-6 text-center text-sm">
        {t("caption")}
      </figcaption>
    </figure>
  );
}
