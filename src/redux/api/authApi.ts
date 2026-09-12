import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { User, LoginRequest, LoginResponse, RegisterRequest, Session } from "@/types/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseApi,
  tagTypes: ["User", "Session"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login/", method: "POST", body }),
    }),
    register: builder.mutation<User, RegisterRequest>({
      query: (body) => ({ url: "/auth/register/", method: "POST", body }),
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me/",
      providesTags: ["User"],
    }),
    logout: builder.mutation<void, { refresh: string }>({
      query: (body) => ({ url: "/auth/logout/", method: "POST", body }),
    }),
    changePassword: builder.mutation<void, { old_password: string; new_password: string }>({
      query: (body) => ({ url: "/auth/change-password/", method: "POST", body }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password/", method: "POST", body }),
    }),
    resetPassword: builder.mutation<void, { token: string; new_password: string }>({
      query: (body) => ({ url: "/auth/reset-password/", method: "POST", body }),
    }),
    getSessions: builder.query<Session[], void>({
      query: () => "/auth/sessions/",
      providesTags: ["Session"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetSessionsQuery,
} = authApi;
