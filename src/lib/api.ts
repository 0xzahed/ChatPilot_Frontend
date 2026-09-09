import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Unwrap standardized API response envelope + handle 401
api.interceptors.response.use(
  (response) => {
    // Unwrap {success: true, data: ...} → res.data = data
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if (body.success === true) {
        // Paginated: {success, data: [...], pagination: {...}}
        if (body.pagination && Array.isArray(body.data)) {
          response.data = {
            results: body.data,
            count: body.pagination.total ?? 0,
            next: null,
            previous: null,
            total_pages: body.pagination.total_pages ?? 0,
            page: body.pagination.page ?? 1,
            page_size: body.pagination.limit ?? 20,
          };
        } else {
          response.data = body.data ?? body;
        }
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isAuthPage = window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register") ||
        window.location.pathname.startsWith("/forgot-password");
      if (!isAuthPage) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }),
  register: (data: { email: string; username: string; first_name?: string; last_name?: string; password: string; password_confirm: string }) =>
    api.post("/auth/register/", data),
  me: () => api.get("/auth/me/"),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
  changePassword: (old_password: string, new_password: string) =>
    api.post("/auth/change-password/", { old_password, new_password }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password/", { email }),
  resetPassword: (token: string, new_password: string) =>
    api.post("/auth/reset-password/", { token, new_password }),
  sessions: () => api.get("/auth/sessions/"),
};

// ─── Workspace API ────────────────────────────────────────────
export const workspaceApi = {
  list: () => api.get("/workspaces/"),
  get: (id: string) => api.get(`/workspaces/${id}/`),
  create: (data: { name: string; slug: string }) => api.post("/workspaces/", data),
  members: (id: string) => api.get(`/workspaces/${id}/members/`),
  settings: (id: string) => api.get(`/workspaces/${id}/settings/`),
  updateSettings: (id: string, data: any) => api.patch(`/workspaces/${id}/settings/`, data),
};

// ─── Conversation/Inbox API ───────────────────────────────────
export const conversationApi = {
  list: (params?: any) => api.get("/conversations/", { params }),
  get: (id: string) => api.get(`/conversations/${id}/`),
  messages: (id: string) => api.get(`/conversations/${id}/messages/`),
  sendMessage: (id: string, data: { content: string; message_type?: string; reply_to?: string; is_note?: boolean }) =>
    api.post(`/conversations/${id}/messages/send/`, data),
  assign: (id: string, agentId: string) => api.post(`/conversations/${id}/assign/`, { assigned_to: agentId }),
  close: (id: string) => api.post(`/conversations/${id}/close/`),
  reopen: (id: string) => api.post(`/conversations/${id}/reopen/`),
  markUnread: (id: string) => api.post(`/conversations/${id}/mark-unread/`),
  aiSuggest: (id: string) => api.post(`/conversations/${id}/ai-suggest/`),
  labels: (id: string) => api.get(`/conversations/${id}/labels/`),
  addLabel: (id: string, labelId: string) => api.post(`/conversations/${id}/labels/`, { label_id: labelId }),
  removeLabel: (id: string, labelId: string) => api.delete(`/conversations/${id}/labels/`, { data: { label_id: labelId } }),
  typing: (id: string, isTyping: boolean) => api.post(`/conversations/${id}/typing/`, { is_typing: isTyping }),
};

// ─── Label API ────────────────────────────────────────────────
export const labelApi = {
  list: () => api.get("/conversations/labels/"),
  create: (data: { name: string; color: string; workspace_id: string }) => api.post("/conversations/labels/", data),
  update: (id: string, data: any) => api.patch(`/conversations/labels/${id}/`, data),
  delete: (id: string) => api.delete(`/conversations/labels/${id}/`),
};

// ─── Customer API ─────────────────────────────────────────────
export const customerApi = {
  list: (params?: any) => api.get("/customers/", { params }),
  get: (id: string) => api.get(`/customers/${id}/`),
  create: (data: any) => api.post("/customers/", data),
  update: (id: string, data: any) => api.patch(`/customers/${id}/`, data),
  delete: (id: string) => api.delete(`/customers/${id}/`),
  timeline: (id: string) => api.get(`/customers/${id}/timeline/`),
};

// ─── Order API ────────────────────────────────────────────────
export const orderApi = {
  list: (params?: any) => api.get("/orders/", { params }),
  get: (id: string) => api.get(`/orders/${id}/`),
  create: (data: any) => api.post("/orders/", data),
  update: (id: string, data: any) => api.patch(`/orders/${id}/`, data),
};

// ─── Complaint API ────────────────────────────────────────────
export const complaintApi = {
  list: (params?: any) => api.get("/complaints/", { params }),
  get: (id: string) => api.get(`/complaints/${id}/`),
  update: (id: string, data: any) => api.patch(`/complaints/${id}/`, data),
};

// ─── AI API ───────────────────────────────────────────────────
export const aiApi = {
  settings: (workspaceId: string) => api.get(`/ai/${workspaceId}/settings/`),
  updateSettings: (workspaceId: string, data: any) => api.patch(`/ai/${workspaceId}/settings/`, data),
  instructions: (workspaceId: string) => api.get(`/ai/${workspaceId}/instructions/`),
  updateInstructions: (workspaceId: string, data: any) => api.patch(`/ai/${workspaceId}/instructions/`, data),
  events: () => api.get("/ai/events/"),
  usage: (workspaceId: string) => api.get(`/ai/${workspaceId}/usage/`),
  test: (workspaceId: string, message: string) =>
    api.post(`/ai/${workspaceId}/test/`, { message }),
};

// ─── Integration API ──────────────────────────────────────────
export const integrationApi = {
  list: () => api.get("/integrations/"),
  connect: (type: string, workspaceId: string) =>
    api.get(`/integrations/connect/${type}/`, { params: { workspace_id: workspaceId } }),
  callback: (type: string, code: string, state: string) =>
    api.get(`/integrations/callback/${type}/`, { params: { code, state } }),
  disconnect: (id: string) => api.post(`/integrations/${id}/disconnect/`),
  sync: (id: string) => api.post(`/integrations/${id}/sync/`),
  webhookEvents: (params?: any) => api.get("/integrations/webhooks/", { params }),
  replayWebhook: (id: string) => api.post(`/integrations/webhooks/${id}/replay/`),
  syncLogs: () => api.get("/integrations/sync-logs/"),
};

// ─── Analytics API ────────────────────────────────────────────
export const analyticsApi = {
  dashboard: (workspaceId: string, days?: number) =>
    api.get("/analytics/dashboard/", { params: { workspace_id: workspaceId, days } }),
  charts: (workspaceId: string, days?: number) =>
    api.get("/analytics/charts/", { params: { workspace_id: workspaceId, days } }),
};

// ─── Team API ─────────────────────────────────────────────────
export const teamApi = {
  list: () => api.get("/team/"),
  invite: (email: string, role: string, workspaceId: string) =>
    api.post("/team/invite/", { email, role, workspace_id: workspaceId }),
  update: (id: string, role: string) => api.patch(`/team/${id}/`, { role }),
};

// ─── Notification API ─────────────────────────────────────────
export const notificationApi = {
  list: (params?: any) => api.get("/notifications/", { params }),
  markRead: (id: string) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post("/notifications/read-all/"),
};

// ─── Billing API ──────────────────────────────────────────────
export const billingApi = {
  plans: () => api.get("/billing/plans/"),
  subscription: (workspaceId: string) => api.get(`/billing/${workspaceId}/subscription/`),
  subscribe: (workspaceId: string, planId: string, billingCycle?: string) =>
    api.post(`/billing/${workspaceId}/subscription/`, { plan_id: planId, billing_cycle: billingCycle }),
  invoices: () => api.get("/billing/invoices/"),
  usage: (workspaceId: string) => api.get(`/usage/${workspaceId}/`),
};

// ─── Usage API ────────────────────────────────────────────────
export const usageApi = {
  summary: (workspaceId: string) => api.get(`/usage/${workspaceId}/`),
};

// ─── Automation API ───────────────────────────────────────────
export const automationApi = {
  rules: () => api.get("/automation/rules/"),
  createRule: (data: any) => api.post("/automation/rules/", data),
  updateRule: (id: string, data: any) => api.patch(`/automation/rules/${id}/`, data),
  deleteRule: (id: string) => api.delete(`/automation/rules/${id}/`),
  comments: () => api.get("/automation/comments/"),
};

// ─── Audit API ────────────────────────────────────────────────
export const auditApi = {
  list: () => api.get("/audit/"),
};

// ─── Webchat API ──────────────────────────────────────────────
export const webchatApi = {
  config: (workspaceId: string) => api.get(`/webchat/config/${workspaceId}/`),
  updateConfig: (workspaceId: string, data: any) => api.patch(`/webchat/config/${workspaceId}/`, data),
};

// ─── Platform Admin API ───────────────────────────────────────
export const adminApi = {
  stats: () => api.get("/admin/stats/"),
  users: (params?: any) => api.get("/admin/users/", { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}/`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}/`),
  workspaces: (params?: any) => api.get("/admin/workspaces/", { params }),
  getWorkspace: (id: string) => api.get(`/admin/workspaces/${id}/`),
  updateWorkspace: (id: string, data: any) => api.patch(`/admin/workspaces/${id}/`, data),
  deleteWorkspace: (id: string) => api.delete(`/admin/workspaces/${id}/`),
  audit: (params?: any) => api.get("/admin/audit/", { params }),
};
