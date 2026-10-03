// Where audio files live. Words carry their own `audio` path in the content;
// characters and story lines don't, so their paths are defined here — in one place.
//
//   characters:   /audio/chars/u1208.mp3          (from the codepoint in fidel.json)
//   words:        whatever the content says, e.g. /audio/words/selam.mp3
//   story lines:  /audio/stories/w1-l3-1.mp3      (lesson id + line number)
//
// Every file can also have a slow version next to it: selam.mp3 → selam-slow.mp3
import { charInfo, type Word } from "@/lib/content";

export type Speed = "natural" | "slow";

export function charAudioPath(char: string): string | undefined {
  const info = charInfo(char);
  if (!info) return undefined;
  return `/audio/chars/${info.codepoint.replace("U+", "u").toLowerCase()}.mp3`;
}

export function wordAudioPath(word: Word): string {
  return word.audio;
}

export function storyLineAudioPath(lessonId: string, lineIndex: number): string {
  return `/audio/stories/${lessonId}-${lineIndex + 1}.mp3`;
}

export function withSpeed(path: string, speed: Speed): string {
  return speed === "slow" ? path.replace(/\.mp3$/, "-slow.mp3") : path;
}

/** Turn a content path (may contain letters like ə or ē) into a safe URL. */
export function audioUrl(path: string, cacheBust?: number): string {
  const url = path.split("/").map(encodeURIComponent).join("/");
  return cacheBust ? `${url}?v=${cacheBust}` : url;
}
