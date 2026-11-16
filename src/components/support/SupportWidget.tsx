"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { createInquiry } from "@/app/actions/support";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/lib/faq";

/**
 * 모든 페이지 오른쪽 아래에 떠 있는 상담 버튼.
 * 누르면 FAQ를 바로 찾아보거나 1:1 문의를 남길 수 있는 창이 열린다.
 */
export function SupportWidget() {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"faq" | "inquiry">("faq");
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Esc로 닫고, 닫으면 초점을 버튼으로 돌려준다.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const faqs = useMemo(
    () =>
      FAQ_CATEGORIES.flatMap((category) =>
        FAQ_ITEMS[category].map((n) => ({
          key: `${category}-${n}`,
          category: t(`faq.categories.${category}`),
          q: t(`faq.items.${category}.${n}.q`),
          a: t(`faq.items.${category}.${n}.a`),
        })),
      ),
    [t],
  );

  const keyword = query.trim().toLowerCase();
  const results = keyword
    ? faqs.filter((f) =>
        `${f.q} ${f.a} ${f.category}`.toLowerCase().includes(keyword),
      )
    : faqs.slice(0, 5);

  function submitInquiry(formData: FormData) {
    setError(false);
    startTransition(async () => {
      const result = await createInquiry(
        {
          name: String(formData.get("name") ?? ""),
          contact: String(formData.get("contact") ?? ""),
          body: String(formData.get("body") ?? ""),
          website: String(formData.get("website") ?? ""),
        },
        locale,
      );
      if (result.ok) setSent(true);
      else setError(true);
    });
  }

  const tabClass = (active: boolean) =>
    `min-h-10 flex-1 rounded-full px-3 text-sm font-semibold transition-colors ${
      active ? "bg-forest text-white" : "text-ink hover:bg-mist-deep"
    }`;

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open && (
        <div
          ref={panelRef}
          id="support-panel"
          role="dialog"
          aria-label={t("support.widget.title")}
          className="border-line absolute right-0 bottom-16 flex max-h-[min(70vh,560px)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl"
        >
          <div className="bg-forest px-5 py-4 text-white">
            <p className="text-lg font-bold">{t("support.widget.title")}</p>
          </div>
          <div className="bg-mist flex gap-1 p-1.5">
            <button
              type="button"
              aria-pressed={tab === "faq"}
              className={tabClass(tab === "faq")}
              onClick={() => setTab("faq")}
            >
              {t("support.widget.tabFaq")}
            </button>
            <button
              type="button"
              aria-pressed={tab === "inquiry"}
              className={tabClass(tab === "inquiry")}
              onClick={() => setTab("inquiry")}
            >
              {t("support.widget.tabInquiry")}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === "faq" ? (
              <div>
                <label htmlFor="widget-search" className="sr-only">
                  {t("support.widget.search")}
                </label>
                <input
                  id="widget-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("support.widget.searchPlaceholder")}
                  className="field-input"
                />
                <div className="mt-3 space-y-2" aria-live="polite">
                  {results.map((f) => (
                    <details
                      key={f.key}
                      className="border-line rounded-2xl border bg-white"
                    >
                      <summary className="text-ink cursor-pointer px-4 py-3 text-sm font-semibold">
                        {f.q}
                      </summary>
                      <p className="text-ink-soft px-4 pb-4 text-sm leading-relaxed">
                        {f.a}
                      </p>
                    </details>
                  ))}
                  {results.length === 0 && (
                    <div className="py-4 text-center">
                      <p className="text-ink-soft text-sm">
                        {t("support.widget.noResult")}
                      </p>
                      <button
                        type="button"
                        className="btn btn-secondary mt-3"
                        onClick={() => setTab("inquiry")}
                      >
                        {t("support.widget.tabInquiry")}
                      </button>
                    </div>
                  )}
                </div>
                <Link
                  href="/support"
                  onClick={() => setOpen(false)}
                  className="text-forest mt-4 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  {t("support.widget.allFaq")}
                </Link>
              </div>
            ) : sent ? (
              <div className="py-6 text-center" role="status">
                <p className="text-ink font-semibold">
                  {t("support.widget.sent")}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary mt-4"
                  onClick={() => setSent(false)}
                >
                  {t("support.widget.another")}
                </button>
              </div>
            ) : (
              <form action={submitInquiry} className="space-y-3">
                <div>
                  <label htmlFor="widget-name" className="field-label">
                    {t("support.widget.name")}
                  </label>
                  <input
                    id="widget-name"
                    name="name"
                    type="text"
                    required
                    maxLength={60}
                    autoComplete="name"
                    className="field-input"
                  />
                </div>
                <div>
                  <label htmlFor="widget-contact" className="field-label">
                    {t("support.widget.contact")}
                  </label>
                  <input
                    id="widget-contact"
                    name="contact"
                    type="text"
                    required
                    maxLength={120}
                    placeholder={t("support.widget.contactHint")}
                    className="field-input"
                  />
                </div>
                <div>
                  <label htmlFor="widget-body" className="field-label">
                    {t("support.widget.message")}
                  </label>
                  <textarea
                    id="widget-body"
                    name="body"
                    rows={4}
                    required
                    maxLength={2000}
                    className="field-input"
                  />
                </div>
                <div className="hidden" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                {error && (
                  <p role="alert" className="field-error">
                    {t("support.widget.error")}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={pending}
                >
                  {pending
                    ? t("support.widget.sending")
                    : t("support.widget.send")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={
          open ? t("support.widget.close") : t("support.widget.open")
        }
        onClick={() => setOpen((v) => !v)}
        className="bg-forest hover:bg-forest-hover ml-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 6.5A2.500 2.500 0 016.5 4h11A2.500 2.500 0 0120 6.500v7a2.500 2.500 0 01-2.500 2.500H11l-4.500 4v-4h0A2.500 2.500 0 014 13.500v-7zM8.500 9.500h7M8.500 12.500h4" />
          )}
        </svg>
      </button>
    </div>
  );
}
