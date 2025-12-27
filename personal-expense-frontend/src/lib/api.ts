import { supabase } from "@/lib/supabase";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ✅ Force headers to be a record
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}${path}`,
    {
      ...options,
      headers,
      credentials: "include",
    }
  );

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? (payload as any).message
        : "API request failed";

    throw new Error(message);
  }

  return payload as T;
}