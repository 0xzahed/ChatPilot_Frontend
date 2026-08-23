import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_platform_admin: boolean;
  is_staff?: boolean;
  is_active?: boolean;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password_confirm: string;
}

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
    getSessions: builder.query<any[], void>({
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
