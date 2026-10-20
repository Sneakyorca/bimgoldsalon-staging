import "server-only";
import type { ApplicationValues } from "@/lib/schemas/application";
import type { ApplicationStatus } from "@/lib/statuses";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: true } | { ok: false; error: string };

export type ApplicationView = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  applicationType: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
};

const SELECT =
  "id, full_name, email, phone, application_type, status, notes, created_at";
type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  application_type: string;
  status: string;
  notes: string;
  created_at: string;
};
const toView = (r: Row): ApplicationView => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone,
  applicationType: r.application_type,
  status: r.status as ApplicationStatus,
  notes: r.notes,
  createdAt: r.created_at,
});

/** From the public form. Only the server can write, and each email is limited to 3 a day. */
export async function createApplication(
  v: ApplicationValues,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = createAdminClient();
  const email = v.email.trim().toLowerCase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await db
    .from("training_applications")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if ((count ?? 0) >= 3)
    return {
      ok: false,
      error:
        "You've already sent a few applications today. We'll be in touch soon.",
    };

  const { data, error } = await db
    .from("training_applications")
    .insert({
      full_name: v.fullName.trim(),
      email,
      phone: v.phone,
      application_type: v.applicationType,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[createApplication]", error?.code, error?.message);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  return { ok: true, id: data.id as string };
}

/** For emails (admin client, no signed-in user needed) */
export async function getApplicationById(
  id: string,
): Promise<ApplicationView | null> {
  const { data } = await createAdminClient()
    .from("training_applications")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? toView(data as Row) : null;
}

/** Admin only (row-level security returns nothing for anyone else) */
export async function listApplications(): Promise<ApplicationView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_applications")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Could not load applications.");
  return (data as Row[]).map(toView);
}

async function update(
  id: string,
  patch: Record<string, unknown>,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_applications")
    .update(patch)
    .eq("id", id);
  if (error) {
    console.error("[updateApplication]", error.code, error.message);
    return { ok: false, error: "Could not update the application." };
  }
  return { ok: true };
}
export const setApplicationStatusRecord = (id: string, status: string) =>
  update(id, { status });
export const setApplicationNotesRecord = (id: string, notes: string) =>
  update(id, { notes: notes.slice(0, 1000) });

export async function deleteApplicationRecord(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_applications")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[deleteApplication]", error.code, error.message);
    return { ok: false, error: "Could not delete the application." };
  }
  return { ok: true };
}
