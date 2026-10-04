// Dev-only: flip a "reviewed" flag in the content files from the studio.
// Files are read fresh from disk and written back in their existing format
// (2-space JSON, no trailing newline), so only the one value changes.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_CAN_SAVE, type ReviewTarget } from "@/lib/studio";

const CONTENT = join(process.cwd(), "content");

type Json = Record<string, unknown>;

async function readJson(file: string): Promise<Json> {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file: string, data: unknown) {
  await writeFile(file, JSON.stringify(data, null, 2));
}

/** Every word object in a lesson file (words, phrase and minimal-pair steps). */
function wordObjects(lessonFile: Json): Json[] {
  const out: Json[] = [];
  for (const lesson of lessonFile.lessons as Json[]) {
    for (const step of lesson.steps as Json[]) {
      if (step.type === "words") out.push(...(step.items as Json[]));
      if (step.type === "phrase") out.push(step.word as Json);
      if (step.type === "exercise" && step.kind === "minimalPair") out.push(step.a as Json, step.b as Json);
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!STUDIO_CAN_SAVE) {
    return NextResponse.json({ error: "Reviews can only be saved while running the app on your computer." }, { status: 403 });
  }
  const { target, reviewed } = (await req.json()) as { target: ReviewTarget; reviewed: boolean };
  if (typeof reviewed !== "boolean" || !target) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (target.type === "family") {
    const file = join(CONTENT, "fidel.json");
    const fidel = await readJson(file);
    const family = (fidel.families as Json[]).find((f) => f.base === target.base);
    if (!family) return NextResponse.json({ error: "No such family." }, { status: 404 });
    family.reviewed = reviewed;
    await writeJson(file, fidel);
    return NextResponse.json({ ok: true });
  }

  const lessonsDir = join(CONTENT, "lessons");
  let changed = 0;
  for (const name of (await readdir(lessonsDir)).filter((n) => n.endsWith(".json"))) {
    const file = join(lessonsDir, name);
    const data = await readJson(file);
    let fileChanged = false;

    if (target.type === "word") {
      // A word can appear in several steps; keep every copy in step.
      for (const w of wordObjects(data)) {
        if (w.id === target.id) {
          w.reviewed = reviewed;
          fileChanged = true;
        }
      }
    } else {
      const lesson = (data.lessons as Json[]).find((l) => l.id === target.lessonId);
      const step = (lesson?.steps as Json[] | undefined)?.[target.stepIndex];
      const line = step?.type === "story" ? (step.lines as Json[])[target.lineIndex] : undefined;
      if (line) {
        line.reviewed = reviewed;
        fileChanged = true;
      }
    }

    if (fileChanged) {
      await writeJson(file, data);
      changed++;
    }
  }
  if (changed === 0) return NextResponse.json({ error: "Nothing matched." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
