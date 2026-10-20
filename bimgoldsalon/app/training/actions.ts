"use server";

import { createApplication } from "@/Data/applications";
import { notifyApplication } from "@/lib/email/notify";
import {
  applicationSchema,
  type ApplicationValues,
} from "@/lib/schemas/application";

export async function submitApplicationAction(
  values: ApplicationValues,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Check your details and try again.",
    };
  const res = await createApplication(parsed.data);
  if (!res.ok) return res;
  notifyApplication(res.id);
  return { ok: true };
}
