export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface Membership {
  id: string;
  role: 'owner' | 'admin' | 'member';
  tenant: Tenant;
  user: User;
}

export interface AuthResponse {
  token: string;
  user: User & { tenant: Tenant };
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  transactionDate: string;
  dueDate?: string;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category?: Category;
  source: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon?: string;
  color?: string;
  isSystem: boolean;
  children?: Category[];
}

export interface Dashboard {
  balance: { income: number; expense: number; balance: number };
  currentMonth: { income: number; expense: number; count: number };
  upcomingTransactions: Transaction[];
  pendingTasks: Task[];
  upcomingReminders: Reminder[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  project?: { id: string; name: string; color?: string };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  status: string;
  budget?: number;
  _count?: { tasks: number };
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  remindAt: string;
  isSent: boolean;
}

export interface Conversation {
  id: string;
  userPhone: string;
  userName?: string;
  status: string;
  lastMessageAt?: string;
  _count: { messages: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
