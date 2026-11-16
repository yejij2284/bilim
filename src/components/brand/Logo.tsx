import { Mascot } from "./Mascot";

/** "bilim" 텍스트 로고. 왼쪽 캐릭터 자리는 Mascot.tsx만 바꾸면 교체된다. */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-white" : "text-forest";
  return (
    <span className={`inline-flex items-center gap-2 ${color}`}>
      <Mascot className="h-8 w-8" />
      <span className="text-[22px] leading-none font-extrabold tracking-tight">
        bilim
      </span>
    </span>
  );
}
