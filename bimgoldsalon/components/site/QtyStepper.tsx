import { Minus, Plus } from "lucide-react";

type Props = {
  qty: number;
  label: string;
  onChange: (delta: number) => void;
  /** Minus is disabled at this quantity. Use 0 to let the minus button reach "remove". */
  min?: number;
  max?: number;
};

const QtyStepper = ({ qty, label, onChange, min = 1, max = 99 }: Props) => (
  <div className="inline-flex h-9 items-center rounded-md border border-black text-[14px] font-semibold">
    <button
      type="button"
      onClick={() => onChange(-1)}
      disabled={qty <= min}
      aria-label={`Decrease ${label} quantity`}
      className="grid h-full w-8 place-items-center disabled:opacity-40"
    >
      <Minus className="size-3" />
    </button>
    <span className="w-7 text-center" aria-live="polite">
      {String(qty).padStart(2, "0")}
    </span>
    <button
      type="button"
      onClick={() => onChange(1)}
      disabled={qty >= max}
      aria-label={`Increase ${label} quantity`}
      className="grid h-full w-8 place-items-center disabled:opacity-40"
    >
      <Plus className="size-3" />
    </button>
  </div>
);

export default QtyStepper;
