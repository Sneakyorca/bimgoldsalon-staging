export const BOOKING_BUFFER_MINUTES = 30;

export function isSlotInPast(dateValue, slot) {
  if (!dateValue) return false;
  const slotDateTime = new Date(`${dateValue}T${slot}:00`);
  return (
    slotDateTime.getTime() < Date.now() + BOOKING_BUFFER_MINUTES * 60 * 1000
  );
}
