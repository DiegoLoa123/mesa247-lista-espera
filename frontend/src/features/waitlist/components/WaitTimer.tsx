import { useEffect, useMemo, useState } from "react";

interface WaitTimerProps {
  createdAt: string;
  maxMinutes?: number;
}

function calculateRemainingSeconds(
  createdAt: string,
  maxMinutes: number,
) {
  const createdTime = new Date(createdAt).getTime();
  const deadline = createdTime + maxMinutes * 60 * 1000;

  return Math.max(
    0,
    Math.floor((deadline - Date.now()) / 1000),
  );
}

export function WaitTimer({
  createdAt,
  maxMinutes = 30,
}: WaitTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemainingSeconds(createdAt, maxMinutes),
  );

  useEffect(() => {
    setRemainingSeconds(
      calculateRemainingSeconds(createdAt, maxMinutes),
    );

    const interval = window.setInterval(() => {
      setRemainingSeconds(
        calculateRemainingSeconds(createdAt, maxMinutes),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [createdAt, maxMinutes]);

  const totalSeconds = maxMinutes * 60;

  const progress = useMemo(() => {
    return Math.max(
      0,
      Math.min(
        100,
        (remainingSeconds / totalSeconds) * 100,
      ),
    );
  }, [remainingSeconds, totalSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;

  const expired = remainingSeconds <= 0;

  return (
    <div className="w-full">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          {expired
            ? "Tiempo de referencia superado"
            : "Tiempo restante de compromiso"}
        </p>

        <div
          className={`mt-2 font-mono text-5xl font-bold tracking-tight sm:text-6xl ${
            expired ? "text-amber-300" : "text-white"
          }`}
        >
          {formattedTime}
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ${
            expired ? "bg-amber-400" : "bg-sky-400"
          }`}
          style={{
            width: `${expired ? 100 : progress}%`,
          }}
        />
      </div>

      {expired && (
        <p className="mt-3 text-center text-sm leading-6 text-amber-200/80">
          El tiempo inicial fue superado. Tu turno continúa activo.
        </p>
      )}
    </div>
  );
}