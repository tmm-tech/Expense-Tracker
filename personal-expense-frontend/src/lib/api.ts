import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "./config";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  if (error || !session?.access_token) {
    throw new Error("No valid session found");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${session.access_token}`,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // empty response body
  }

  if (!res.ok) {
    console.error("API error response:", json);
    throw new Error(json?.message || "API request failed");
  }

  if (json && typeof json === "object" && "data" in json) {
    const payload = json.data;
    return (Array.isArray(payload) ? payload : [payload]) as T;
  }

  return json as T;
}