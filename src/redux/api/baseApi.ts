import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mutex to prevent multiple simultaneous refresh attempts
const mutex = new Mutex();

// Custom base query with auth token + refresh-token logic
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (typeof window === "undefined") {
    // SSR — no token available
    return fetchBaseQuery({ baseUrl: `${API_URL}/api` })(args, api, extraOptions);
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
      return result;
    }

    // Try to refresh
    const release = await mutex.acquire();
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return result;
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

  return result;
};

export default baseQuery;
