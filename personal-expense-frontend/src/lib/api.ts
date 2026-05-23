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
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session ?? null;

    if (error || !session?.access_token) {
      console.error("apiFetch: No valid session", {
        error,
        data,
      });

      throw new Error("No valid session found");
    }

    // Detect multipart/form-data
    const isFormData =
      options.body instanceof FormData;

    // Headers
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),

      Authorization: `Bearer ${session.access_token}`,
    };

    // Only attach JSON content type
    // for non-FormData requests
    if (!isFormData) {
      headers["Content-Type"] =
        "application/json";
    }

    // Request
    const res = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
        credentials: "include",
      },
    );

    let json: any = null;

    try {
      json = await res.json();
    } catch {
      console.log(
        "apiFetch: empty response body",
      );
    }

    if (!res.ok) {
      console.error(
        "apiFetch error response:",
        json,
      );

      throw new Error(
        json?.message ||
          `API request failed (${res.status})`,
      );
    }

    return json as T;
  } catch (err: any) {
    console.error(
      "apiFetch unexpected error:",
      err,
    );

    throw new Error(
      err?.message ||
        "Unexpected API error",
    );
  }
}