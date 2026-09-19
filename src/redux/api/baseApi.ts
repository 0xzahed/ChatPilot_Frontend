import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

// API calls go through the same-origin /api prefix — next.config.ts rewrites
// proxy them to the backend, so HttpOnly auth cookies are always first-party
// (works for any hostname the app is served on). NEXT_PUBLIC_API_URL is used
// only for the rewrite destination and WebSocket URLs.
const API_BASE = "/api";

// Mutex to prevent multiple simultaneous refresh attempts
const mutex = new Mutex();

/**
 * Unwrap standardized API response envelope.
 * Backend now returns: {success: true, message, data, pagination?}
 * This transformer unwraps `data` so RTK Query sees the raw payload.
 * For paginated responses, it returns {results: data, ...pagination} for backward compat.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function unwrapResponse(result: any): any {
  if (!result?.data) return result;
  const body = result.data;
  // Standardized envelope: {success, message, data, ...}
  if (body && typeof body === "object" && "success" in body) {
    if (body.success === true) {
      // Paginated response: {success, data: [...], pagination: {...}}
      if (body.pagination && Array.isArray(body.data)) {
        result.data = {
          results: body.data,
          count: body.pagination.total ?? 0,
          next: null,
          previous: null,
          total_pages: body.pagination.total_pages ?? 0,
          page: body.pagination.page ?? 1,
          page_size: body.pagination.limit ?? 20,
        };
      } else {
        // Plain success: unwrap data
        result.data = body.data ?? body;
      }
    } else if (body.success === false) {
      // Error response: {success: false, message, code}
      result.error = {
        status: result.meta?.response?.status ?? 400,
        data: {
          success: false,
          error: {
            code: body.code ?? "ERROR",
            message: body.message ?? "Unknown error",
            details: body.errors ?? body.details ?? null,
          },
        },
      };
      result.data = undefined;
    }
  }
  return result;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: "include", // send HttpOnly auth cookies
  prepareHeaders: (headers) => {
    // Marks cookie-authenticated requests as intentional XHR — required by
    // the backend's CSRF check for cookie auth on unsafe methods.
    headers.set("X-Requested-With", "XMLHttpRequest");
    // Note: Content-Type is left unset — fetchBaseQuery auto-sets
    // application/json for plain objects and multipart boundaries for FormData.
    return headers;
  },
});

// Custom base query — cookie auth + refresh-on-401 via refresh cookie
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = unwrapResponse(await rawBaseQuery(args, api, extraOptions));

  // 401 → try the HttpOnly refresh cookie once
  if (result.error && result.error.status === 401) {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password");
    const isAuthEndpoint =
      typeof args === "string"
        ? args.includes("/auth/")
        : (args.url ?? "").includes("/auth/");

    if (isAuthPage || isAuthEndpoint) {
      return result;
    }

    const release = await mutex.acquire();
    try {
      // Another call may have refreshed already — retry once to check.
      const retry = unwrapResponse(await rawBaseQuery(args, api, extraOptions));
      if (!(retry.error && retry.error.status === 401)) {
        return retry;
      }

      const refreshResult = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: "{}",
      });

      if (refreshResult.ok) {
        // New access cookie is set — retry original request
        result = unwrapResponse(await rawBaseQuery(args, api, extraOptions));
      } else if (typeof window !== "undefined") {
        // Full reload — clears RTK cache/contexts on session expiry
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    } finally {
      release();
    }
  }

  return result;
};

export default baseQuery;
