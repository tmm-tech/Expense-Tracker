import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "./config";

/**
 * Generic API fetch helper that attaches Supabase session token
 * and normalizes common API response patterns.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    // Get current Supabase session
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session ?? null;

    if (error || !session?.access_token) {
      console.error("apiFetch: No valid session", { error, data });
      throw new Error("No valid session found");
    }

    // Merge headers with Authorization
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${session.access_token}`,
    };

    // Perform request
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Parse JSON body safely
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      console.log("apiFetch: empty response body (status", res.status, ")");
    }

    // Handle non-OK responses
    if (!res.ok) {
      console.error("apiFetch error response:", json);
      throw new Error(json?.message || `API request failed (${res.status})`);
    }

    // Normalize `{ success, data }` pattern
    if (json && typeof json === "object" && "data" in json) {
      const payload = json.data;
      // Defensive: ensure array if downstream expects it
      return (Array.isArray(payload) ? payload : [payload]) as T;
    }
    if ("message" in json && json.success) {
      // API returned a success message but no data
      return [] as T;
    }
    // Return direct JSON response
    return json as T;
  } catch (err: any) {
    console.error("apiFetch unexpected error:", err);
    throw new Error(err?.message || "Unexpected API error");
  }
}
