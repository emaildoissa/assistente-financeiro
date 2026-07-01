const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.assessor.automacao.free.nf/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string; tenantName: string }) =>
    request<import('../types/api').AuthResponse>('POST', '/auth/register', data),

  login: (data: { email: string; password: string }) =>
    request<import('../types/api').AuthResponse>('POST', '/auth/login', data),

  me: () => request<any>('GET', '/auth/me'),

  // Dashboard
  getDashboard: () =>
    request<import('../types/api').Dashboard>('GET', '/dashboard'),

  // Transactions
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<import('../types/api').PaginatedResponse<import('../types/api').Transaction>>('GET', `/transactions${qs}`);
  },

  createTransaction: (data: Partial<import('../types/api').Transaction>) =>
    request<import('../types/api').Transaction>('POST', '/transactions', data),

  getBalance: () =>
    request<{ income: number; expense: number; balance: number }>('GET', '/transactions/balance'),

  getSummary: (startDate: string, endDate: string) =>
    request<any>('GET', `/transactions/summary?startDate=${startDate}&endDate=${endDate}`),

  // Categories
  getCategories: (type?: string) =>
    request<import('../types/api').Category[]>('GET', `/categories${type ? `?type=${type}` : ''}`),

  createCategory: (data: Partial<import('../types/api').Category>) =>
    request<import('../types/api').Category>('POST', '/categories', data),

  // Tasks
  getTasks: (status?: string) =>
    request<import('../types/api').Task[]>('GET', `/tasks${status ? `?status=${status}` : ''}`),

  createTask: (data: Partial<import('../types/api').Task>) =>
    request<import('../types/api').Task>('POST', '/tasks', data),

  updateTask: (id: string, data: Partial<import('../types/api').Task>) =>
    request<import('../types/api').Task>('PUT', `/tasks/${id}`, data),

  // Projects
  getProjects: () =>
    request<import('../types/api').Project[]>('GET', '/projects'),

  createProject: (data: Partial<import('../types/api').Project>) =>
    request<import('../types/api').Project>('POST', '/projects', data),

  // Reminders
  getReminders: () =>
    request<import('../types/api').Reminder[]>('GET', '/reminders'),

  createReminder: (data: Partial<import('../types/api').Reminder>) =>
    request<import('../types/api').Reminder>('POST', '/reminders', data),

  // Conversations
  getConversations: () =>
    request<import('../types/api').Conversation[]>('GET', '/conversations'),

  // Users
  getUsers: () => request<import('../types/api').User[]>('GET', '/users'),
};
