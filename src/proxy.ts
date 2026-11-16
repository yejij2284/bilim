import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16부터 middleware.ts 대신 proxy.ts를 쓴다.
// 첫 방문: 브라우저 언어(Accept-Language)로 /ko, /en, /zh 중 하나로 보낸다.
// 재방문: NEXT_LOCALE 쿠키에 기억된 언어로 보낸다.
export default createMiddleware(routing);

export const config = {
  // api, admin, 정적 파일은 다국어 경로 처리에서 뺀다.
  matcher: ["/((?!api|admin|_next|_vercel|uploads|.*\\..*).*)"],
};
