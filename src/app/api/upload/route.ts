import { NextResponse } from "next/server";
import { MAX_PHOTOS } from "@/lib/schemas/application";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, saveImage } from "@/lib/storage";

/** 상태 사진 업로드 (여러 장). 응답: { urls: string[] } */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0 || files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: "count" }, { status: 400 });
  }
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "type" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "size" }, { status: 400 });
    }
  }

  try {
    const urls = await Promise.all(files.map(saveImage));
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
}
