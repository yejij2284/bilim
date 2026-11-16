import { getTranslations } from "next-intl/server";
import { GRADES } from "@/lib/constants";
import { GradeBadge } from "./GradeBadge";

/** 등급 기준표 */
export async function GradeTable() {
  const t = await getTranslations("grades");
  return (
    <div className="border-line overflow-visible rounded-3xl border bg-white">
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">{t("tableTitle")}</caption>
        <thead>
          <tr className="bg-mist text-ink-soft text-sm">
            <th scope="col" className="rounded-tl-3xl px-4 py-3.5 font-semibold sm:px-6">
              {t("colGrade")}
            </th>
            <th scope="col" className="px-4 py-3.5 font-semibold sm:px-6">
              {t("colMeaning")}
            </th>
            <th scope="col" className="rounded-tr-3xl px-4 py-3.5 font-semibold sm:px-6">
              {t("colPrice")}
            </th>
          </tr>
        </thead>
        <tbody>
          {GRADES.map((grade) => (
            <tr key={grade} className="border-line border-t">
              <th scope="row" className="px-4 py-4 font-normal sm:px-6">
                <GradeBadge grade={grade} />
              </th>
              <td className="text-ink px-4 py-4 sm:px-6">
                {t(`${grade}.meaning`)}
              </td>
              <td className="text-ink px-4 py-4 font-semibold sm:px-6">
                {t(`${grade}.price`)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
