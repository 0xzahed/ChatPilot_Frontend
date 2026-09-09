import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mutex to prevent multiple simultaneous refresh attempts
const mutex = new Mutex();

/**
 * Unwrap standardized API response envelope.
 * Backend now returns: {success: true, message, data, pagination?}
 * This transformer unwraps `data` so RTK Query sees the raw payload.
 * For paginated responses, it returns {results: data, ...pagination} for backward compat.
 */
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

// Custom base query with auth token + refresh-token logic
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (typeof window === "undefined") {
    // SSR — no token available
    const r = await fetchBaseQuery({ baseUrl: `${API_URL}/api` })(args, api, extraOptions);
    return unwrapResponse(r);
  }

  const token = localStorage.getItem("access_token");

  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  });

  let result = await rawBaseQuery(args, api, extraOptions);

  // 401 → try to refresh token once
  if (result.error && result.error.status === 401) {
    const pathname = window.location.pathname;
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password");

    if (isAuthPage) {
      return unwrapResponse(result);
    }

    // Try to refresh
    const release = await mutex.acquire();
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return unwrapResponse(result);
      }

      const refreshResult = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResult.ok) {
        const data = await refreshResult.json();
        localStorage.setItem("access_token", data.access);
        // Retry original request with new token
        const newRawBaseQuery = fetchBaseQuery({
          baseUrl: `${API_URL}/api`,
          prepareHeaders: (headers) => {
            headers.set("Authorization", `Bearer ${data.access}`);
            headers.set("Content-Type", "application/json");
            return headers;
          },
        });
        result = await newRawBaseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    } finally {
      release();
    }
  }

  return unwrapResponse(result);
};

export default baseQuery;
