import type { WaitlistStatus } from "../../waitlist/types/waitlist";

interface StatusBadgeProps {
  status: WaitlistStatus;
}

const statusConfig: Record<
  WaitlistStatus,
  {
    label: string;
    className: string;
  }
> = {
  WAITING: {
    label: "Esperando",
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },

  CALLED: {
    label: "Llamado",
    className:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },

  SEATED: {
    label: "Sentado",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },

  LEFT: {
    label: "Se retiró",
    className:
      "border-slate-500/20 bg-slate-500/10 text-slate-400",
  },

  NO_SHOW: {
    label: "No llegó",
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}