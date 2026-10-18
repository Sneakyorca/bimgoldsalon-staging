import { supabase } from "../libs/supabase";

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, price, category, created_at, extra_info, image_url")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBooking(
  userId,
  serviceId,
  date,
  time,
  depositAmount,
  contact,
) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      service_id: serviceId,
      date,
      time,
      deposit_amount: depositAmount,
      status: "pending",
      is_paid: false,
      customer_name: contact.name,
      customer_phone: contact.phone,
      customer_email: contact.email,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "That time slot was just booked by someone else. Please pick another time.",
      );
    }
    throw error;
  }

  return data;
}

export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(name, price)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllBookingsAdmin() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(name, price)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw error;
}

export async function updateBookingPayment(bookingId, paid) {
  const { error } = await supabase
    .from("bookings")
    .update({ is_paid: paid })
    .eq("id", bookingId);

  if (error) throw error;
}

export async function getBookedSlots(serviceId, date) {
  const { data, error } = await supabase.rpc("get_booked_slots", {
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) throw error;
  return data.map((row) => row.slot_time);
}

export async function confirmBookingPayment(bookingId, success) {
  const { data, error } = await supabase.rpc("confirm_booking_payment", {
    p_booking_id: bookingId,
    p_success: success,
  });

  if (error) throw error;
  return data;
}
export async function updateBookingNotes(bookingId, notes) {
  const { error } = await supabase
    .from("bookings")
    .update({ notes })
    .eq("id", bookingId);

  if (error) throw error;
}
