export const formatPrice = (n: number) =>
  `£ ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
