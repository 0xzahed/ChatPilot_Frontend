import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { authApi } from "@/redux/api/authApi";
import { workspaceApi } from "@/redux/api/workspaceApi";
import { conversationApi } from "@/redux/api/conversationApi";
import { customerApi } from "@/redux/api/customerApi";
import { orderApi } from "@/redux/api/orderApi";
import { complaintApi } from "@/redux/api/complaintApi";
import { aiApi } from "@/redux/api/aiApi";
import { integrationApi } from "@/redux/api/integrationApi";
import { analyticsApi } from "@/redux/api/analyticsApi";
import { teamApi } from "@/redux/api/teamApi";
import { notificationApi } from "@/redux/api/notificationApi";
import { billingApi } from "@/redux/api/billingApi";
import { automationApi } from "@/redux/api/automationApi";
import { auditApi } from "@/redux/api/auditApi";
import { webchatApi } from "@/redux/api/webchatApi";
import { usageApi } from "@/redux/api/usageApi";
import { adminApi } from "@/redux/api/adminApi";
import { labelApi } from "@/redux/api/labelApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [workspaceApi.reducerPath]: workspaceApi.reducer,
    [conversationApi.reducerPath]: conversationApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [complaintApi.reducerPath]: complaintApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
    [integrationApi.reducerPath]: integrationApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [automationApi.reducerPath]: automationApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [webchatApi.reducerPath]: webchatApi.reducer,
    [usageApi.reducerPath]: usageApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [labelApi.reducerPath]: labelApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      workspaceApi.middleware,
      conversationApi.middleware,
      customerApi.middleware,
      orderApi.middleware,
      complaintApi.middleware,
      aiApi.middleware,
      integrationApi.middleware,
      analyticsApi.middleware,
      teamApi.middleware,
      notificationApi.middleware,
      billingApi.middleware,
      automationApi.middleware,
      auditApi.middleware,
      webchatApi.middleware,
      usageApi.middleware,
      adminApi.middleware,
      labelApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

// Enable refetchOnFocus / refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
