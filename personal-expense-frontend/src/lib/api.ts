import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "./config";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // ✅ READ BODY ONCE
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // empty response body (204 etc.)
  }

  // ❌ Handle error responses
  if (!res.ok) {
    throw new Error(json?.message || "API request failed");
  }

  // ✅ Support `{ success, data }` pattern
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  // ✅ Support direct JSON responses
  return json as T;
}