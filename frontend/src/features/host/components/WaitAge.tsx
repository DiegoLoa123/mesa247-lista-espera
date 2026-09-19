interface WaitAgeProps {
  createdAt: string;
}

function getMinutesSince(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const now = Date.now();

  return Math.max(
    0,
    Math.floor((now - created) / 60000),
  );
}

export function WaitAge({
  createdAt,
}: WaitAgeProps) {
  const minutes = getMinutesSince(createdAt);

  let label = "En tiempo";
  let className =
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

  if (minutes >= 15 && minutes < 20) {
    label = "Normal";

    className =
      "border-lime-400/20 bg-lime-400/10 text-lime-300";
  }

  if (minutes >= 20 && minutes < 25) {
    label = "Atención";

    className =
      "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }

  if (minutes >= 25 && minutes < 30) {
    label = "Demora";

    className =
      "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (minutes >= 30) {
    label = "Crítico";

    className =
      "border-red-400/20 bg-red-400/10 text-red-300";
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-sm font-semibold text-slate-200">
        {minutes} min
      </span>

      <span
        className={`w-fit rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
      >
        {label}
      </span>
    </div>
  );
}