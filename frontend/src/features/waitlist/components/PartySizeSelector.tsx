interface PartySizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function PartySizeSelector({
  value,
  onChange,
}: PartySizeSelectorProps) {
  const decrease = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (value < 20) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex h-14 items-center justify-between rounded-xl border border-slate-700/80 bg-[#111821] px-2">
      <button
        type="button"
        onClick={decrease}
        disabled={value <= 1}
        className="flex h-10 w-12 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Quitar persona"
      >
        −
      </button>

      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-white">
          {value}
        </span>

        <span className="text-sm text-slate-500">
          {value === 1 ? "persona" : "personas"}
        </span>
      </div>

      <button
        type="button"
        onClick={increase}
        disabled={value >= 20}
        className="flex h-10 w-12 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Agregar persona"
      >
        +
      </button>
    </div>
  );
}