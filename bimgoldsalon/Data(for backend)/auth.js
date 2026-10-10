import { supabase } from "../libs/supabase.js";
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/redirect`,
    },
  });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
  };
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return {
    user: data.user,
    session: data.session,
  };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user || null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function forgotPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
