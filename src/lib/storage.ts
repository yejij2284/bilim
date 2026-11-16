import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

// 업로드한 사진 저장소.
// - 로컬: 프로젝트의 uploads/ 폴더에 저장하고 /api/files/<이름> 으로 보여 준다.
// - 배포(Vercel): 디스크에 저장할 수 없으므로, BLOB_READ_WRITE_TOKEN 환경변수가 있으면
//   Vercel Blob 에 저장하고 그 주소를 그대로 쓴다. (Vercel 프로젝트에 Blob 저장소를 연결하면
//   이 환경변수가 자동으로 생긴다.)

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = Object.keys(EXT_BY_TYPE);
const FILE_NAME = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

/** 사진을 저장하고 화면에서 쓸 주소를 돌려준다. */
export async function saveImage(file: File): Promise<string> {
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error("unsupported-type");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("too-large");

  const name = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, name),
    Buffer.from(await file.arrayBuffer()),
  );
  return `/api/files/${name}`;
}

/** 로컬에 저장된 사진을 읽는다. 이름이 형식에 맞지 않거나 없으면 null. */
export async function readImage(
  name: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  if (!FILE_NAME.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop()!;
    return { data, contentType: TYPE_BY_EXT[ext] };
  } catch {
    return null;
  }
}
