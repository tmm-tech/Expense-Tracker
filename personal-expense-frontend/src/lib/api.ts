import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "./config";

interface ApiError extends Error {
  status?: number;
  error?: string;
  requiresPassword?: boolean;
  success?: boolean;
  data?: unknown;
}

/**
 * Generic API fetch helper that attaches Supabase session token
 * and preserves structured API errors from the backend.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const { data, error: sessionError } =
      await supabase.auth.getSession();

    const session = data?.session ?? null;

    if (sessionError || !session?.access_token) {
      console.error("apiFetch: No valid session", {
        error: sessionError,
        data,
      });

      throw new Error("No valid session found");
    }

    /* =========================
       FORM DATA
    ========================= */

    const isFormData =
      options.body instanceof FormData;

    /* =========================
       HEADERS
    ========================= */

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),

      Authorization: `Bearer ${session.access_token}`,
    };

    /*
     * IMPORTANT:
     * Do NOT set Content-Type manually for FormData.
     * The browser must set the multipart boundary.
     */
    if (!isFormData) {
      headers["Content-Type"] =
        "application/json";
    }

    /* =========================
       REQUEST
    ========================= */

    const res = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
        credentials: "include",
      },
    );

    /* =========================
       READ RESPONSE ONCE
    ========================= */

    let json: any = null;

    const contentType =
      res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {

      json = await res.json().catch(() => null);

    } else {
      try {
        const text = await res.text();

        if (text) {
          json = {
            message: text,
          };
        }
      } catch {
        console.error(
          "apiFetch: Failed to read response body",
        );
      }
    }

    /* =========================
       API ERROR
    ========================= */

    if (!res.ok) {
      console.error(
        "apiFetch error response:",
        json,
      );

      const apiError = new Error(
        json?.error ||
        json?.message ||
        `API request failed (${res.status})`,
      ) as ApiError;

      apiError.status = res.status;

      apiError.error =
        json?.error;

      apiError.message =
        json?.error ||
        json?.message ||
        `API request failed (${res.status})`;

      apiError.requiresPassword =
        json?.requiresPassword === true;

      apiError.success =
        json?.success;

      apiError.data =
        json?.data;

      throw apiError;
    }

    /* =========================
       SUCCESS
    ========================= */

    return json as T;

  } catch (err: any) {
    console.error(
      "apiFetch unexpected error:",
      err,
    );

    /*
     * IMPORTANT:
     * Do NOT create a new Error here.
     *
     * The original API error may contain:
     * - requiresPassword
     * - status
     * - error
     * - success
     */
    throw err;
  }
}