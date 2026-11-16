"use client";

import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { UnreadBadge } from "./UnreadBadge";

const NAV = [
  { href: "/about", key: "about" },
  { href: "/rent", key: "rent" },
  { href: "/sell", key: "sell" },
  { href: "/support", key: "support" },
  { href: "/my", key: "my" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-line sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="bilim" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label={t("main")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-mist-deep text-forest"
                      : "text-ink hover:bg-mist"
                  }`}
                >
                  {t(item.key)}
                  {item.key === "my" && <UnreadBadge />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Suspense>
              <LocaleSwitcher />
            </Suspense>
          </div>
          <Link href="/apply" className="btn btn-primary min-h-10 px-5">
            {t("apply")}
          </Link>
          <button
            type="button"
            className="text-forest hover:bg-mist inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-line border-t bg-white lg:hidden">
          <nav aria-label={t("main")} className="container-page py-3">
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-12 items-center rounded-xl px-3 text-base font-medium ${
                      isActive(item.href)
                        ? "bg-mist-deep text-forest"
                        : "text-ink"
                    }`}
                  >
                    {t(item.key)}
                  {item.key === "my" && <UnreadBadge />}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-line mt-3 border-t pt-4 pb-2 sm:hidden">
              <Suspense>
                <LocaleSwitcher />
              </Suspense>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
