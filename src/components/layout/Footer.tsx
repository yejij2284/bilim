import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { InstallApp } from "@/components/pwa/InstallApp";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="bg-forest text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-3 text-sm text-white/80">{t("footer.tagline")}</p>
          <div className="mt-5">
            <InstallApp tone="light" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">{t("footer.company")}</h2>
          {/* TODO: 실제 회사 정보(상호, 대표자, 사업자등록번호, 주소, 연락처) */}
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {t("footer.companyPlaceholder")}
          </p>
        </div>

        <nav aria-label={t("footer.links")}>
          <h2 className="text-sm font-semibold">{t("footer.links")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/terms" className="hover:text-white hover:underline">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-white hover:underline"
              >
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="hover:text-white hover:underline"
              >
                {t("nav.support")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="container-page py-5 text-xs text-white/70">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
