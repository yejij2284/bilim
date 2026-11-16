import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { normalizeApplicationCode } from "@/lib/application-code";
import { formatDateTime } from "@/lib/date";
import { localName } from "@/lib/format";
import { getMySession } from "@/lib/session";
import { LookupForm } from "@/components/my/LookupForm";
import { LeaveButton } from "@/components/my/LeaveButton";
import { MessageThread } from "@/components/my/MessageThread";
import { Timeline } from "@/components/my/Timeline";

export const dynamic = "force-dynamic";

export default async function MyPage({
  params,
  searchParams,
}: PageProps<"/[locale]/my">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const applicationId = await getMySession();
  const application = applicationId
    ? await db.application.findUnique({
        where: { id: applicationId },
        include: {
          items: { include: { product: true, package: true } },
          statusLogs: { orderBy: { createdAt: "asc" } },
        },
      })
    : null;

  // 조회 전: 신청번호 + 전화번호 입력
  if (!application) {
    const query = await searchParams;
    const raw = Array.isArray(query.code) ? query.code[0] : query.code;
    return (
      <section className="bg-mist py-10 sm:py-16">
        <div className="container-page max-w-xl">
          <h1 className="text-ink mb-6 text-3xl font-extrabold tracking-tight">
            {t("my.title")}
          </h1>
          <LookupForm defaultCode={raw ? normalizeApplicationCode(raw) : ""} />
        </div>
      </section>
    );
  }

  const itemNames = application.items.map((item) => {
    if (item.kind === "CATEGORY" && item.category) {
      return t(`categories.${item.category}`);
    }
    if (item.package) {
      return `${t("packages.title")}: ${localName(item.package, locale)}`;
    }
    if (item.product) {
      return `${item.product.brand} ${localName(item.product, locale)}`;
    }
    return item.label;
  });

  return (
    <section className="bg-mist py-10 sm:py-16">
      <div className="container-page max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-ink text-3xl font-extrabold tracking-tight">
            {t("my.title")}
          </h1>
          <LeaveButton />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5">
            <section className="card">
              <dl className="space-y-4 text-[15px]">
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("my.summary.code")}
                  </dt>
                  <dd className="text-forest text-xl font-extrabold tracking-wide">
                    {application.code}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("my.summary.type")}
                  </dt>
                  <dd className="text-ink font-semibold">
                    {t(`apply.type.${application.type}`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("my.summary.items")}
                  </dt>
                  <dd className="text-ink">
                    <ul className="space-y-0.5">
                      {itemNames.map((name, i) => (
                        <li key={i}>{name}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("my.summary.schedule")}
                  </dt>
                  <dd className="text-ink">
                    {application.preferredDate} ·{" "}
                    {t(`apply.schedule.timeSlots.${application.timeSlot}`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("my.summary.address")}
                  </dt>
                  <dd className="text-ink break-words">
                    {application.address} {application.addressDetail}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft text-sm">
                    {t("my.summary.appliedAt")}
                  </dt>
                  <dd className="text-ink">
                    {formatDateTime(application.createdAt, locale)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="card">
              <h2 className="text-ink mb-5 text-lg font-bold">
                {t("my.timeline.title")}
              </h2>
              <Timeline
                type={application.type}
                status={application.status}
                logs={application.statusLogs}
              />
            </section>
          </div>

          <section className="card self-start">
            <h2 className="text-ink text-lg font-bold">
              {t("my.messages.title")}
            </h2>
            <p className="text-ink-soft mt-1 mb-4 text-sm">
              {t("my.messages.intro")}
            </p>
            <MessageThread closed={application.status === "CANCELED"} />
          </section>
        </div>
      </div>
    </section>
  );
}
