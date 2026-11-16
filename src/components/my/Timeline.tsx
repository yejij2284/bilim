import { getLocale, getTranslations } from "next-intl/server";
import { STATUS_FLOW, statusKey, type ApplicationType } from "@/lib/constants";
import { formatDateTime } from "@/lib/date";

/**
 * 진행 상태 타임라인.
 * 접수 -> 상담 중 -> 일정 확정 -> 배송/수거 완료 -> 이용 중(대여) 또는 정산 완료(팔기)
 */
export async function Timeline({
  type,
  status,
  logs,
}: {
  type: string;
  status: string;
  logs: { status: string; createdAt: Date }[];
}) {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const flow = STATUS_FLOW[type as ApplicationType] ?? STATUS_FLOW.RENT;
  const canceled = status === "CANCELED";
  const currentIndex = flow.indexOf(status);

  // 각 단계에 가장 최근에 도달한 시각
  const reachedAt = new Map<string, Date>();
  for (const log of logs) reachedAt.set(log.status, log.createdAt);

  return (
    <div>
      {canceled && (
        <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-[15px] text-red-800">
          <strong className="font-bold">{t("status.CANCELED")}</strong>
          <span className="mt-1 block">{t("my.timeline.canceled")}</span>
        </p>
      )}
      <ol>
        {flow.map((step, i) => {
          const done = !canceled && i < currentIndex;
          const current = !canceled && i === currentIndex;
          const date = reachedAt.get(step);
          const last = i === flow.length - 1;
          const stateLabel = current
            ? t("my.timeline.current")
            : done
              ? t("my.timeline.done")
              : t("my.timeline.upcoming");

          return (
            <li
              key={step}
              className="relative flex gap-4 pb-6 last:pb-0"
              aria-current={current ? "step" : undefined}
            >
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5 ${done ? "bg-forest" : "bg-line"}`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-forest bg-forest text-white"
                    : current
                      ? "border-forest text-forest bg-white"
                      : "border-line text-ink-soft bg-white"
                }`}
              >
                {done ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.5 8.5l3 3 6-6.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div
                className={`flex-1 ${current ? "bg-mist -mt-1.5 rounded-2xl px-3 py-2" : "pt-1"}`}
              >
                <p
                  className={`text-[15px] ${
                    current
                      ? "text-forest font-bold"
                      : done
                        ? "text-ink font-semibold"
                        : "text-ink-soft"
                  }`}
                >
                  {t(`status.${statusKey(step, type)}`)}
                  <span
                    className={`ml-2 text-xs font-semibold ${current ? "text-forest" : "text-ink-soft"}`}
                  >
                    {stateLabel}
                  </span>
                </p>
                {date && (done || current) && (
                  <p className="text-ink-soft mt-0.5 text-sm">
                    {formatDateTime(date, locale)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
