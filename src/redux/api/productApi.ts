import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock?: number;
  category?: string;
  image?: string | null;
  description?: string;
  is_active?: boolean;
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseApi,
  tagTypes: ["Product", "Category"],
  endpoints: (builder) => ({
    getProducts: builder.query<{ results: Product[]; count: number; next: string | null; previous: string | null } | Product[], any>({
      query: (params) => ({ url: "/products/", method: "GET", params }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}/`,
      providesTags: (r, e, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, any>({
      query: (body) => ({ url: "/products/", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/products/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "Product", id }],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => "/products/categories/",
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
} = productApi;
