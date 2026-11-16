"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

/** 신청번호 복사 버튼 */
export function CopyCode({ code }: { code: string }) {
  const t = useTranslations("apply.done");
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // 복사가 막힌 브라우저에서는 번호를 직접 적어 두면 된다.
        }
      }}
    >
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
