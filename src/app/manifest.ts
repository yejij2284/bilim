import type { MetadataRoute } from "next";

// 앱 설치 정보 (PWA). /manifest.webmanifest 로 제공된다.
// 설치한 앱을 열면 start_url "/" 로 들어가고, 저장된 언어(또는 휴대폰 언어)의 화면으로 이동한다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "bilim - Appliance rental for foreigners in Korea",
    short_name: "bilim",
    description:
      "Don't buy. Just bilim. 외국인을 위한 가전 렌탈 · Appliance rental for foreigners · 面向外国人的家电租赁",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#123c2f",
    lang: "ko",
    categories: ["lifestyle", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Rent / 대여 / 租赁", url: "/rent", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Sell / 팔기 / 出售", url: "/sell", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My request / 내 신청 / 我的申请", url: "/my", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
