// bilim 서비스 워커 (PWA)
// - 페이지: 항상 인터넷에서 새로 받는다. 연결이 끊기면 저장해 둔 오프라인 안내 화면을 보여 준다.
// - 정적 파일(빌드된 JS·CSS, 아이콘, 제품 사진): 한 번 받으면 저장해 두고 다시 쓴다.
// - API, 신청·메시지 같은 데이터: 저장하지 않는다 (항상 최신 상태).
// 이 파일을 고치면 VERSION 을 올린다. 그래야 설치된 앱이 새 버전으로 바뀐다.

const VERSION = "v1";
const STATIC_CACHE = `bilim-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("bilim-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/products/")
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 페이지 이동: 인터넷 우선, 실패하면 오프라인 화면
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((res) => res || Response.error()),
      ),
    );
    return;
  }

  // 정적 파일: 저장된 것 우선, 없으면 받아서 저장
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
  }
  // 그 밖의 요청(API 등)은 브라우저가 평소대로 처리한다.
});
