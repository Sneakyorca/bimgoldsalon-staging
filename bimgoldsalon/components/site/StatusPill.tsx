const tones = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  payment_failed: "bg-red-100 text-red-800",
  unpaid: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-700",
} as const;
export const statusTone = tones as Record<string, string>;
export const toneFor = (value: string) =>
  tones[value as keyof typeof tones] ?? "bg-gray-100 text-gray-700";
export default function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize ${toneFor(value)}`}
    >
      {value}
    </span>
  );
}
