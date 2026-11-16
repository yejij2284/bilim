"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { MAX_PHOTOS } from "@/lib/schemas/application";

/** 상태 사진 업로드(여러 장). 고르는 즉시 서버에 올리고 주소 목록을 넘긴다. */
export function PhotoUploader({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const t = useTranslations("apply");
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList);
    if (urls.length + files.length > MAX_PHOTOS) {
      setError(t("errors.tooManyPhotos", { max: MAX_PHOTOS }));
      return;
    }
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      if (!res.ok) throw new Error("upload");
      const data = (await res.json()) as { urls: string[] };
      onChange([...urls, ...data.urls]);
    } catch {
      setError(t("errors.upload"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {t("items.photos")}{" "}
        <span className="text-ink-soft font-normal">({t("optional")})</span>
      </label>
      <p className="text-ink-soft mb-2 text-sm">
        {t("items.photosHint", { max: MAX_PHOTOS })}
      </p>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={uploading || urls.length >= MAX_PHOTOS}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="text-ink-soft file:border-sage file:text-forest block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border file:bg-white file:px-5 file:font-semibold"
      />
      {uploading && (
        <p className="text-ink-soft mt-2 text-sm" role="status">
          {t("items.uploading")}
        </p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {urls.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {urls.map((url, i) => (
            <li key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={t("items.photoAlt", { index: i + 1 })}
                className="border-line aspect-square w-full rounded-xl border object-cover"
              />
              <button
                type="button"
                aria-label={t("items.removePhoto", { index: i + 1 })}
                onClick={() => onChange(urls.filter((u) => u !== url))}
                className="bg-ink absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-white"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
