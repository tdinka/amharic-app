// Small building blocks shared by the lesson screens.

export function StepHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold leading-snug">{children}</h2>;
}

export function StepText({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-lg leading-relaxed text-ink/90">{children}</p>;
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
    plain: "border-line bg-card",
    active: "border-ochre bg-ochre-light scale-105",
    correct: "border-leaf bg-leaf-light",
    wrong: "border-berbere bg-berbere-light",
    dim: "border-line bg-card opacity-50",
  };
  const dims = size === "lg" ? "min-h-[6.5rem] min-w-[5.5rem] text-6xl" : "min-h-[5rem] min-w-[4.25rem] text-5xl";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-2 transition ${dims} ${states[state]} ${
        onClick && !disabled ? "active:scale-95" : ""
      }`}
    >
      <span className="font-ethiopic leading-none">{char}</span>
      {sub && <span className="text-sm leading-none">{sub}</span>}
    </button>
  );
}
