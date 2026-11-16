import type { ReactNode } from "react";

// 종류별 일러스트. 실제 사진(imageUrl)이 없을 때 보여 준다.
// 색: 본체 흰색, 선 #123c2f(forest), 면 #70866a(sage) / #dce7d7
const LINE = "#123c2f";
const SAGE = "#70866a";
const SOFT = "#dce7d7";
const body = { fill: "#ffffff", stroke: LINE, strokeWidth: 3 };
const line = { stroke: LINE, strokeWidth: 3, strokeLinecap: "round" as const };

const ILLUSTRATIONS: Record<string, ReactNode> = {
  fridge: (
    <>
      <rect x="66" y="14" width="68" height="118" rx="8" {...body} />
      <path d="M66 58h68" {...line} />
      <path d="M78 30v16M78 70v26" {...line} stroke={SAGE} strokeWidth="4" />
      <path d="M76 132v6M124 132v6" {...line} />
    </>
  ),
  washer: (
    <>
      <rect x="54" y="18" width="92" height="114" rx="8" {...body} />
      <path d="M54 44h92" {...line} />
      <circle cx="70" cy="31" r="4" fill={SAGE} />
      <rect x="110" y="26" width="26" height="10" rx="5" fill={SOFT} />
      <circle cx="100" cy="88" r="30" {...body} />
      <circle cx="100" cy="88" r="20" fill={SOFT} />
      <path d="M84 92c8-8 14 6 32-4" {...line} stroke={SAGE} fill="none" />
    </>
  ),
  microwave: (
    <>
      <rect x="30" y="38" width="140" height="80" rx="8" {...body} />
      <rect x="42" y="50" width="88" height="56" rx="5" fill={SOFT} stroke={LINE} strokeWidth="3" />
      <path d="M58 92l24-28M78 96l24-30" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="150" cy="62" r="7" {...body} />
      <path d="M142 82h16M142 94h16" {...line} stroke={SAGE} />
      <path d="M46 118v6M154 118v6" {...line} />
    </>
  ),
  aircon: (
    <>
      <rect x="24" y="34" width="152" height="48" rx="10" {...body} />
      <path d="M38 68h124" {...line} />
      <circle cx="158" cy="48" r="3.5" fill={SAGE} />
      <path d="M40 48h44" {...line} stroke={SOFT} strokeWidth="5" />
      <path d="M62 96c-6 8 6 10 0 20M100 96c-6 8 6 10 0 22M138 96c-6 8 6 10 0 20" {...line} stroke={SAGE} fill="none" />
    </>
  ),
  tv: (
    <>
      <rect x="26" y="24" width="148" height="88" rx="6" {...body} />
      <rect x="34" y="32" width="132" height="72" rx="2" fill={SOFT} />
      <path d="M52 86l26-28 20 18 14-12 26 22" stroke={SAGE} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="140" cy="48" r="6" fill="#ffffff" />
      <path d="M100 112v14M72 128h56" {...line} />
    </>
  ),
  vacuum: (
    <>
      <path d="M118 22l-36 96" {...line} strokeWidth="5" />
      <rect x="100" y="26" width="34" height="46" rx="10" transform="rotate(20 117 49)" {...body} />
      <rect x="107" y="38" width="20" height="22" rx="5" transform="rotate(20 117 49)" fill={SOFT} />
      <path d="M126 12l10 4" {...line} strokeWidth="6" stroke={SAGE} />
      <rect x="46" y="116" width="66" height="16" rx="8" {...body} />
      <path d="M58 124h42" {...line} stroke={SOFT} />
    </>
  ),
  ricecooker: (
    <>
      <path d="M48 70h104v40a18 18 0 01-18 18H66a18 18 0 01-18-18V70z" {...body} />
      <path d="M52 70a48 34 0 0196 0" {...body} />
      <rect x="90" y="28" width="20" height="10" rx="5" fill={SAGE} />
      <rect x="80" y="86" width="40" height="22" rx="6" fill={SOFT} stroke={LINE} strokeWidth="3" />
      <circle cx="100" cy="97" r="4" fill={SAGE} />
      <path d="M40 84h8M152 84h8" {...line} />
    </>
  ),
};

/**
 * 제품 사진. imageUrl이 있으면 실제 사진을, 없으면 종류별 일러스트를 보여 준다.
 * 실제 사진은 관리자 > 제품 관리에서 올린다.
 * TODO: 실제 제품 사진
 */
export function ProductImage({
  category,
  imageUrl,
  alt,
  className = "",
}: {
  category: string;
  imageUrl?: string | null;
  alt: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        className={`bg-mist-deep aspect-[4/3] w-full rounded-2xl object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-mist-deep flex aspect-[4/3] w-full items-center justify-center rounded-2xl ${className}`}
    >
      <svg viewBox="0 0 200 150" className="h-[78%] w-auto" fill="none" aria-hidden="true">
        <ellipse cx="100" cy="138" rx="62" ry="5" fill="#d5ddd2" />
        {ILLUSTRATIONS[category] ?? ILLUSTRATIONS.microwave}
      </svg>
    </div>
  );
}
