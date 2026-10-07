import { AnswerMark } from "@/components/Marks";

// Small building blocks shared by the lesson screens.

export function StepHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold leading-snug">{children}</h2>;
}

/** Runs of Ethiopic characters inside lesson text, shown a little larger so their marks are visible. */
export function WithFidel({ text }: { text: string }) {
  const parts = text.split(/([\u1200-\u137F\u2D80-\u2DDF\uAB00-\uAB2F]+)/u);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-ethiopic text-[1.35em] leading-none">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function StepText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-lg leading-relaxed text-ink/90">
      {typeof children === "string" ? <WithFidel text={children} /> : children}
    </p>
  );
}

export function Badge({ children, tone = "ochre" }: { children: React.ReactNode; tone?: "ochre" | "indigo" | "leaf" }) {
  const tones = {
    ochre: "bg-ochre-light text-ink",
    indigo: "bg-indigo-light text-indigo",
    leaf: "bg-leaf-light text-leaf",
  };
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

/** A character tile: big Amharic, sound underneath. Used for options and listening grids. */
export function CharTile({
  char,
  sub,
  onClick,
  state = "plain",
  size = "lg",
  disabled,
  label,
}: {
  char: string;
  sub?: React.ReactNode;
  onClick?: () => void;
  state?: "plain" | "active" | "correct" | "wrong" | "dim";
  size?: "md" | "lg";
  disabled?: boolean;
  label?: string;
}) {
  const states = {
    plain: "border border-line bg-card",
    active: "border-2 border-ink bg-ochre scale-105",
    correct: "border-2 border-leaf bg-leaf-light",
    wrong: "border-2 border-rose bg-rose-light",
    dim: "border border-line bg-card opacity-50",
  };
  const dims = size === "lg" ? "min-h-[6.5rem] min-w-[5.5rem] text-6xl" : "min-h-[5rem] min-w-[4.25rem] text-5xl";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`relative flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition ${dims} ${states[state]} ${
        onClick && !disabled ? "active:scale-95" : ""
      }`}
    >
      <span className="font-ethiopic leading-none">{char}</span>
      {sub && <span className="text-sm leading-none">{sub}</span>}
      {(state === "correct" || state === "wrong") && <AnswerMark correct={state === "correct"} className="absolute right-1.5 top-1.5" />}
    </button>
  );
}
