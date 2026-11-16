/**
 * 전자레인지 캐릭터 자리 표시.
 * TODO: 실제 캐릭터 SVG가 정해지면 이 파일의 <svg> 내용만 교체한다.
 * 색은 currentColor를 따라가므로 밝은/어두운 배경 모두에서 쓸 수 있다.
 */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* 몸통 */}
      <rect
        x="3"
        y="8"
        width="34"
        height="23"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* 문(창) */}
      <rect
        x="7.5"
        y="12.5"
        width="18"
        height="14"
        rx="3.5"
        fill="currentColor"
        opacity="0.14"
      />
      {/* 눈 */}
      <circle cx="13" cy="18.5" r="1.6" fill="currentColor" />
      <circle cx="20" cy="18.5" r="1.6" fill="currentColor" />
      {/* 입 */}
      <path
        d="M13.5 22.2c1.6 1.7 4.4 1.7 6 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* 버튼 */}
      <circle cx="31" cy="15" r="1.7" fill="currentColor" />
      <circle cx="31" cy="21" r="1.7" fill="currentColor" />
      {/* 다리 */}
      <path
        d="M10 31v3M30 31v3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
