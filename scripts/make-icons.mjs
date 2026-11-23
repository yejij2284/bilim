// 앱 아이콘(PNG)을 만든다. 캐릭터가 확정되면 아래 MASCOT 의 SVG 내용만 바꾸고 다시 실행한다.
//   node scripts/make-icons.mjs
// 결과: public/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
// TODO: 실제 전자레인지 캐릭터가 정해지면 교체 (src/components/brand/Mascot.tsx 와 같은 그림)
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const FOREST = "#123c2f";

// Mascot.tsx 와 같은 그림 (40x40 좌표), 흰색
const MASCOT = `
  <rect x="3" y="8" width="34" height="23" rx="6" stroke="#fff" stroke-width="2.5" fill="none"/>
  <rect x="7.5" y="12.5" width="18" height="14" rx="3.5" fill="#fff" opacity="0.18"/>
  <circle cx="13" cy="18.5" r="1.6" fill="#fff"/>
  <circle cx="20" cy="18.5" r="1.6" fill="#fff"/>
  <path d="M13.5 22.2c1.6 1.7 4.4 1.7 6 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <circle cx="31" cy="15" r="1.7" fill="#fff"/>
  <circle cx="31" cy="21" r="1.7" fill="#fff"/>
  <path d="M10 31v3M30 31v3" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
`;

/**
 * @param {number} size 출력 크기(px)
 * @param {number} scale 캐릭터가 차지하는 비율 (maskable 은 안전 영역 안에 들어가도록 작게)
 * @param {boolean} rounded 배경 모서리를 둥글게 할지
 */
function svg(size, scale, rounded) {
  const inner = size * scale;
  const offset = (size - inner) / 2;
  const radius = rounded ? size * 0.22 : 0;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${FOREST}"/>
  <g transform="translate(${offset} ${offset}) scale(${inner / 40})">${MASCOT}</g>
</svg>`);
}

await mkdir("public/icons", { recursive: true });
const jobs = [
  ["public/icons/icon-192.png", 192, 0.66, true],
  ["public/icons/icon-512.png", 512, 0.66, true],
  // 안드로이드가 원·둥근 사각형 등으로 잘라 쓰는 아이콘: 꽉 찬 배경, 가운데 60% 안에 그림
  ["public/icons/maskable-512.png", 512, 0.56, false],
  // 아이폰 홈 화면 아이콘: iOS가 모서리를 직접 깎으므로 사각형
  ["public/icons/apple-touch-icon.png", 180, 0.66, false],
];
for (const [file, size, scale, rounded] of jobs) {
  await sharp(svg(size, scale, rounded)).png().toFile(file);
  console.log("만듦:", file);
}
