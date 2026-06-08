"use server";

import { signIn, signOut } from "@/lib/auth";

export interface AuthState {
  error?: string;
}

/** Only allow same-site relative paths to prevent open-redirects. */
function safeCallback(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

export async function devLogin(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!email) return { error: "Email is required" };

  await signIn("dev-login", {
    email,
    name,
    redirectTo: safeCallback(formData.get("callbackUrl")),
  });
  return {};
}

export async function googleLogin(formData: FormData): Promise<void> {
  await signIn("google", { redirectTo: safeCallback(formData.get("callbackUrl")) });
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
