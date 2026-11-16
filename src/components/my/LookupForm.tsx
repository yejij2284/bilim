"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { lookupApplication } from "@/app/actions/my";

/** 신청번호 + 전화번호 조회 폼 */
export function LookupForm({ defaultCode }: { defaultCode: string }) {
  const t = useTranslations("my");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await lookupApplication(null, formData);
      if (result) {
        setError(result.error);
        return;
      }
      // 조회에 성공하면 같은 주소를 다시 그려 신청 내용을 보여 준다.
      window.dispatchEvent(new Event("bilim:unread-changed"));
      router.replace("/my");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="card space-y-5">
      <p className="text-ink-soft text-[15px]">{t("lookup.intro")}</p>
      <div>
        <label htmlFor="lookup-code" className="field-label">
          {t("lookup.code")}
        </label>
        <input
          id="lookup-code"
          name="code"
          type="text"
          required
          autoCapitalize="characters"
          autoComplete="off"
          defaultValue={defaultCode}
          placeholder={t("lookup.codePlaceholder")}
          className="field-input uppercase placeholder:normal-case"
        />
      </div>
      <div>
        <label htmlFor="lookup-phone" className="field-label">
          {t("lookup.phone")}
        </label>
        <input
          id="lookup-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="010-1234-5678"
          className="field-input"
          aria-describedby="lookup-phone-hint"
        />
        <p id="lookup-phone-hint" className="text-ink-soft mt-1.5 text-sm">
          {t("lookup.phoneHint")}
        </p>
      </div>
      {error && (
        <p role="alert" className="field-error">
          {t(`errors.${error}`)}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? t("lookup.submitting") : t("lookup.submit")}
      </button>
      <p className="text-ink-soft text-center text-sm">
        {t("lookup.noApplication")}{" "}
        <Link
          href="/apply"
          className="text-forest font-semibold underline underline-offset-4"
        >
          {t("lookup.applyLink")}
        </Link>
      </p>
    </form>
  );
}
