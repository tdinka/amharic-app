// Dev-only: save a recording from the studio into public/audio/...
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { allowedAudioPaths, STUDIO_CAN_SAVE } from "@/lib/studio";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!STUDIO_CAN_SAVE) {
    return NextResponse.json({ error: "Recordings can only be saved while running the app on your computer." }, { status: 403 });
  }
  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!allowedAudioPaths().has(path)) {
    return NextResponse.json({ error: `Not a recording the lessons use: ${path}` }, { status: 400 });
  }
  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "The recording is empty or too large." }, { status: 400 });
  }
  // MP3 files start with an ID3 tag or an MPEG frame sync.
  const isMp3 = bytes.subarray(0, 3).toString("latin1") === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  if (!isMp3) {
    return NextResponse.json({ error: "That isn't an MP3 file." }, { status: 400 });
  }
  const file = join(process.cwd(), "public", path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes);
  return NextResponse.json({ ok: true, path, bytes: bytes.length });
}
