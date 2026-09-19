/**
 * Centralized API types — single source of truth for all DRF response shapes.
 * All RTK Query API slices and the legacy axios client import from here.
 */

// ─── Auth ────────────────────────────────────────────────────
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
  last_active_at?: string | null;
  date_joined?: string;
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

export interface Session {
  id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
}

// ─── Workspace ──────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  owner?: string;
  is_active?: boolean;
  is_suspended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMember {
  id: string;
  user: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface WorkspaceSettings {
  [key: string]: unknown;
}

// ─── Conversation / Inbox ───────────────────────────────────
export interface Conversation {
  id: string;
  customer?: string;
  customer_name?: string;
  customer_avatar?: string | null;
  customer_phone?: string;
  channel?: string;
  channel_icon?: string;
  status?: string;
  subject?: string;
  last_message?: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count?: number;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  is_complaint?: boolean;
  has_order?: boolean;
  handled_by?: string;
  language?: string;
  ai_enabled?: boolean;
  page_name?: string | null;
  labels?: Label[];
  created_at?: string;
  updated_at?: string;
}

export interface FacebookPage {
  page_id: string;
  page_name: string;
  integration_id?: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender_type: string;
  sender_name?: string;
  content: string;
  message_type?: string;
  reply_to?: string | null;
  reply_to_content?: string;
  is_note?: boolean;
  is_read?: boolean;
  attachments?: MessageAttachment[];
  ai_metadata?: Record<string, unknown>;
  sent_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MessageAttachment {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
}

export interface SendMessageRequest {
  content: string;
  message_type?: string;
  reply_to?: string;
  is_note?: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  workspace_id?: string;
  created_at?: string;
}

// ─── Customer ───────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  channel?: string;
  avatar?: string | null;
  language?: string;
  notes?: string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  total_orders?: number;
  total_spent?: number;
  is_vip?: boolean;
  last_interaction_at?: string;
  conversation_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerTimelineEvent {
  id: string;
  event_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── Order ──────────────────────────────────────────────────
export interface Order {
  id: string;
  order_number?: string;
  customer?: string;
  customer_name?: string;
  items?: OrderItem[];
  total?: number;
  subtotal?: number;
  discount?: number;
  delivery_charge?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  phone?: string;
  shipping_address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  product?: string;
  product_name?: string;
  product_sku?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// ─── Complaint ──────────────────────────────────────────────
export interface Complaint {
  id: string;
  title?: string;
  description?: string;
  customer?: string;
  customer_name?: string;
  status?: string;
  priority?: string;
  assigned_to?: string | null;
  detected_by_ai?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─── Integration ────────────────────────────────────────────
export interface Integration {
  id: string;
  type: string;
  status?: string;
  connected?: boolean;
  is_active?: boolean;
  integration_type?: string;
  display_name?: string;
  workspace?: string;
  created_at?: string;
}

export interface WebhookEvent {
  id: string;
  workspace?: string;
  source?: string;
  event_type?: string;
  status?: string;
  attempts?: number;
  created_at?: string;
  processed_at?: string;
}

export interface SyncLog {
  id: string;
  integration?: string;
  sync_type?: string;
  entity_type?: string;
  status?: string;
  records_synced?: number;
  created_at?: string;
}

// ─── AI ─────────────────────────────────────────────────────
export interface AISettings {
  mode?: string;
  provider?: string;
  model_name?: string;
  base_url?: string;
  api_key?: string;
  temperature?: number;
  max_tokens?: number;
  confidence_threshold?: number;
  [key: string]: unknown;
}

export interface AIInstructions {
  business_name?: string;
  business_description?: string;
  tone?: string;
  language?: string;
  response_length?: string;
  custom_instructions?: string;
  [key: string]: unknown;
}

export interface AIEvent {
  id: string;
  event_type?: string;
  model_name?: string;
  latency_ms?: number;
  created_at?: string;
}

export interface AIUsage {
  ai_replies?: number;
  ai_suggestions?: number;
  tokens_input?: number;
  tokens_output?: number;
  [key: string]: unknown;
}

// ─── Automation ─────────────────────────────────────────────
export interface AutomationRule {
  id: string;
  name?: string;
  rule_type?: string;
  trigger?: string;
  action?: string;
  is_active?: boolean;
  use_ai?: boolean;
  channel?: string;
  response_template?: string;
  created_at?: string;
}

export interface CommentAutomation {
  id: string;
  channel?: string;
  author_name?: string;
  content?: string;
  is_replied?: boolean;
  is_auto_replied?: boolean;
  created_at?: string;
}

// ─── Team ──────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status?: string;
  joined_at?: string;
}

// ─── Notification ───────────────────────────────────────────
export interface Notification {
  id: string;
  notification_type?: string;
  type?: string;
  title?: string;
  body?: string;
  message?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
}

// ─── Billing ────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  price_monthly?: number;
  price_yearly?: number;
  message_limit?: number;
  team_member_limit?: number;
  is_trial?: boolean;
  is_active?: boolean;
}

export interface Subscription {
  id: string;
  plan?: Plan;
  status?: string;
  billing_cycle?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface Invoice {
  id: string;
  invoice_number?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: string;
}

export interface UsageRecord {
  workspace?: string;
  period_start?: string;
  period_end?: string;
  messages_used?: number;
  message_limit?: number;
  messages_remaining?: number;
  ai_replies?: number;
  ai_suggestions?: number;
  comment_automation?: number;
  vision_requests?: number;
  tokens_input?: number;
  tokens_output?: number;
  tokens_used?: number;
  estimated_cost?: number;
  team_members?: number;
  team_member_limit?: number;
}

// ─── Analytics ──────────────────────────────────────────────
export interface DashboardStats {
  total_conversations?: number;
  open_conversations?: number;
  unread_messages?: number;
  total_customers?: number;
  total_orders?: number;
  revenue?: number;
  ai_handled?: number;
  human_handled?: number;
  ai_automation_rate?: number;
  conversion_rate?: number;
  avg_response_time_seconds?: number;
  total_complaints?: number;
  open_complaints?: number;
  messages_used?: number;
  message_limit?: number;
  messages_remaining?: number;
}

export interface ChartData {
  conversations_over_time?: { date: string; value: number }[];
  orders_over_time?: { date: string; value: number }[];
  revenue_over_time?: { date: string; value: number }[];
  channel_performance?: { channel: string; count: number }[];
  conversion_funnel?: { stage: string; value: number }[];
  ai_events?: { type: string; count: number }[];
  customer_growth?: { date: string; value: number }[];
  ai_vs_human?: { date: string; ai: number; human: number }[];
  response_time_trend?: { date: string; value: number }[];
}

// ─── Webchat ───────────────────────────────────────────────
export interface WebchatConfig {
  is_enabled?: boolean;
  title?: string;
  position?: string;
  theme_color?: string;
  welcome_message?: string;
  allowed_domains?: string[];
  [key: string]: unknown;
}

// ─── Audit ─────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  workspace?: string;
  workspace_name?: string;
  user?: string;
  user_email?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// ─── Platform Admin ────────────────────────────────────────
export interface AdminStats {
  users?: { total?: number; active?: number; inactive?: number; platform_admins?: number; new_7d?: number };
  workspaces?: { total?: number; active?: number; suspended?: number; new_7d?: number };
  conversations?: { total?: number; open?: number; new_7d?: number };
  customers?: { total?: number };
  orders?: { total?: number };
  plan_distribution?: { plan: string; workspace_id: string; status: string }[];
}

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  is_platform_admin?: boolean;
  is_staff?: boolean;
  is_active?: boolean;
  email_verified_at?: string | null;
  last_active_at?: string | null;
  date_joined?: string;
  workspace_count?: number;
  workspace_name?: string | null;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  owner?: string;
  owner_email?: string;
  owner_name?: string;
  is_active?: boolean;
  is_suspended?: boolean;
  member_count?: number;
  conversation_count?: number;
  customer_count?: number;
  plan_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ─── Pagination ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  total_pages?: number;
  page?: number;
  page_size?: number;
}

// ─── API Error ──────────────────────────────────────────────
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
}
