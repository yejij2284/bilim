"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

// Daum(카카오) 우편번호 서비스. 키 발급 없이 쓸 수 있다.
// t1.daumcdn.net 도메인은 2026-11-30에 종료되므로 t1.kakaocdn.net 을 쓴다.
const SCRIPT_URL =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        width: string;
        height: string;
      }) => { embed: (element: HTMLElement) => void };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("postcode-script"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/** 우편번호 검색 버튼. 주소를 고르면 onSelect로 우편번호와 주소를 넘긴다. */
export function AddressSearch({
  onSelect,
}: {
  onSelect: (postcode: string, address: string) => void;
}) {
  const t = useTranslations("apply.address");
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  async function openSearch() {
    setFailed(false);
    setOpen(true);
    try {
      await loadScript();
      if (!boxRef.current || !window.daum) return;
      boxRef.current.innerHTML = "";
      new window.daum.Postcode({
        oncomplete: (data) => {
          const base = data.roadAddress || data.jibunAddress;
          const address = data.buildingName
            ? `${base} (${data.buildingName})`
            : base;
          onSelect(data.zonecode, address);
          setOpen(false);
        },
        width: "100%",
        height: "100%",
      }).embed(boxRef.current);
    } catch {
      setFailed(true);
      setOpen(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-secondary"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openSearch())}
      >
        {open ? t("closeSearch") : t("search")}
      </button>
      {failed && (
        <p role="alert" className="field-error">
          {t("searchFailed")}
        </p>
      )}
      <div
        ref={boxRef}
        className={`border-line mt-3 h-[420px] overflow-hidden rounded-2xl border ${open ? "block" : "hidden"}`}
      />
    </div>
  );
}
