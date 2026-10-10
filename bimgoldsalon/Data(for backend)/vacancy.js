import { supabase } from "../libs/supabase";

export async function submitApplication({
  fullName,
  email,
  phone,
  applicationType,
}) {
  const { error } = await supabase.from("vacancy_applications").insert({
    full_name: fullName,
    email,
    phone,
    application_type: applicationType,
  });

  if (error) throw error;

  const application = {
    full_name: fullName,
    email,
    phone,
    application_type: applicationType,
  };

  supabase.functions
    .invoke("send-vacancy-email", { body: { application } })
    .catch(() => {});

  return application;
}
