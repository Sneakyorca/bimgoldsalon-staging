"use client";

import { updateProfileAction } from "@/app/profile/actions";
import type { EditProfileValues } from "@/lib/schemas/auth";
import EditProfileForm from "./EditProfileForm";

type User = { name: string; email: string; phone?: string };

export default function EditProfileClient({ user }: { user: User }) {
  const submit = async (values: EditProfileValues) => {
    const result = await updateProfileAction(values);
    if (!result.ok) throw new Error(result.error);
    return result.message;
  };
  return <EditProfileForm user={user} onSubmit={submit} />;
}
