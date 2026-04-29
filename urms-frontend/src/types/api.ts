/** Resource row from GET /resources/ */
export interface ApiResource {
  resource_id: number;
  resource_name: string;
  description: string | null;
  type_id: number;
  type_name?: string | null;
  total_quantity: number;
  available_quantity: number;
  lease_per_day?: number | null;
  security_deposit?: number | null;
  is_leasable: boolean;
  fine_per_day?: number | null;
  attributes_json?: Record<string, unknown> | null;
}

export interface ApiResourceType {
  type_id: number;
  type_name: string;
  description?: string | null;
}

export interface ApiLoanRequest {
  request_id: number;
  user_id: number;
  user_name?: string | null;
  resource_id: number;
  resource_name?: string | null;
  status: string;
  notes?: string | null;
  loan_days: number;
  start_date?: string | null;
  end_date?: string | null;
  requested_at?: string | null;
  approved_at?: string | null;
  approved_by?: number | null;
  due_date?: string | null;
  returned_at?: string | null;
}

export interface ApiTransaction {
  transaction_id: number;
  request_id: number;
  user_id: number;
  issue_date?: string | null;
  due_date?: string | null;
  return_date?: string | null;
  return_requested_at?: string | null;
  fine_amount: number;
  transaction_status: string;
  resource_name?: string | null;
  resource_type?: string | null;
}

export interface ApiPendingReturn {
  transaction_id: number;
  request_id: number;
  user_id: number;
  user_name?: string | null;
  user_email?: string | null;
  resource_name?: string | null;
  due_date?: string | null;
  return_requested_at?: string | null;
}

export interface ApiEligibleReturn {
  request_id: number;
  resource_name: string | null;
  returned_at: string | null;
}

export interface ApiFeedbackOut {
  feedback_id: number;
  user_id: number;
  user_name?: string | null;
  scope: string;
  request_id?: number | null;
  resource_name?: string | null;
  rating: number;
  category?: string | null;
  comment?: string | null;
  created_at?: string | null;
}

export interface ApiUserProfile {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  year_of_study: string | null;
  roll_number: string | null;
  role: string;
  is_blocked: boolean;
}

export interface ApiRule {
  rule_id: number;
  rule_key?: string | null;
  category: string;
  rule_name: string;
  value: number;
  unit: string;
  type_id?: number | null;
}

export interface ApiNotification {
  notification_id: number;
  title: string;
  message: string;
  is_read: boolean;
  request_id: number | null;
  created_at: string | null;
}
