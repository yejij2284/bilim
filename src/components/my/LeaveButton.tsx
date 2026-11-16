"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { leaveMyApplication } from "@/app/actions/my";

/** 조회 상태를 지우고 다른 신청을 조회할 수 있게 한다. */
export function LeaveButton() {
  const t = useTranslations("my.summary");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await leaveMyApplication();
          window.dispatchEvent(new Event("bilim:unread-changed"));
          router.refresh();
        })
      }
    >
      {t("leave")}
    </button>
  );
}
