const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('language') || 'fr';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': lang,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: unknown }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: Record<string, unknown>) =>
    request<{ token: string; user: unknown }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<{ user: unknown }>('/auth/me'),

  demoAccounts: () =>
    request<{ accounts: { email: string; firstName: string; lastName: string; role: string; detail: string }[]; password: string }>('/auth/demo-accounts'),
};

// Missions
export const missionsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ missions: unknown[]; pagination: unknown }>(`/missions${query}`);
  },

  get: (id: string) => request<{ mission: unknown }>(`/missions/${id}`),

  create: (data: Record<string, unknown>) =>
    request<{ mission: unknown }>('/missions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ mission: unknown }>(`/missions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  publish: (id: string) =>
    request<{ mission: unknown }>(`/missions/${id}/publish`, { method: 'POST' }),

  apply: (id: string, message?: string) =>
    request<{ application: unknown }>(`/missions/${id}/apply`, { method: 'POST', body: JSON.stringify({ message }) }),

  myMissions: () => request<{ missions: unknown[] }>('/missions/company/my'),
};

// Workers
export const workersApi = {
  profile: () => request<{ profile: unknown }>('/workers/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    request<{ profile: unknown }>('/workers/profile', { method: 'PUT', body: JSON.stringify(data) }),

  applications: () => request<{ applications: unknown[] }>('/workers/applications'),

  contracts: () => request<{ contracts: unknown[] }>('/workers/contracts'),

  payments: () => request<{ payments: unknown[]; summary: { totalEarned: number; totalPending: number } }>('/workers/payments'),
};

// Companies
export const companiesApi = {
  profile: () => request<{ company: unknown }>('/companies/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    request<{ company: unknown }>('/companies/profile', { method: 'PUT', body: JSON.stringify(data) }),

  contracts: () => request<{ contracts: unknown[] }>('/companies/contracts'),

  dashboard: () => request<{ stats: Record<string, number> }>('/companies/dashboard'),

  acceptApplication: (id: string) =>
    request<{ contract: unknown }>(`/companies/applications/${id}/accept`, { method: 'POST' }),

  rejectApplication: (id: string) =>
    request<unknown>(`/companies/applications/${id}/reject`, { method: 'POST' }),

  presence: () => request<{ punches: unknown[] }>('/companies/presence'),

  reports: () => request<{ reports: unknown[] }>('/companies/reports'),
};

// Shifts (worker view of missions/quarts)
export const shiftsApi = {
  available: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ shifts: unknown[]; pagination: unknown }>(`/workers/shifts/available${query}`);
  },
  detail: (id: string) =>
    request<{ shift: unknown }>(`/workers/shifts/available/${id}`),
  mine: () =>
    request<{ toConfirm: unknown[]; confirmed: unknown[] }>('/workers/shifts/mine'),
  apply: (id: string, message?: string) =>
    request<{ application: unknown }>(`/workers/shifts/${id}/apply`, { method: 'POST', body: JSON.stringify({ message }) }),
  confirm: (id: string) =>
    request<{ message: string }>(`/workers/shifts/${id}/confirm`, { method: 'POST' }),
  reportDelay: (id: string, data: { minutes: number; reason: string }) =>
    request<{ message: string }>(`/workers/shifts/${id}/report-delay`, { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id: string, reason: string) =>
    request<{ message: string }>(`/workers/shifts/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
};

// Billing (facturation)
export const billingApi = {
  list: () =>
    request<{ toDeclare: unknown[]; approved: unknown[] }>('/workers/billing'),
  declare: (data: { declarationId: string; actualHours: number; note?: string }) =>
    request<{ declaration: unknown }>('/workers/billing/declare', { method: 'POST', body: JSON.stringify(data) }),
};

// Notifications
export const notificationsApi = {
  list: () =>
    request<{ notifications: unknown[] }>('/workers/notifications'),
  markRead: (id: string) =>
    request<{ success: boolean }>(`/workers/notifications/${id}/read`, { method: 'POST' }),
  unreadCount: () =>
    request<{ count: number }>('/workers/notifications/unread-count'),
};

// Avatar
export const avatarApi = {
  upload: async (file: File): Promise<{ avatarUrl: string }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_BASE}/workers/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

// TimePunch (horodateur)
export const timepunchApi = {
  punch: (data: { missionId: string; type: string; latitude: number; longitude: number }) =>
    request<{ punch: unknown }>('/workers/timepunch', { method: 'POST', body: JSON.stringify(data) }),
  get: (missionId: string) =>
    request<{ punches: unknown[]; activePunch: unknown | null }>(`/workers/timepunch/${missionId}`),
};

// Manager
export const managerApi = {
  dashboard: () => request<{ stats: Record<string, number> }>('/manager/dashboard'),

  missions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ missions: unknown[] }>(`/manager/missions${query}`);
  },
  createMission: (data: Record<string, unknown>) =>
    request<{ mission: unknown }>('/manager/missions', { method: 'POST', body: JSON.stringify(data) }),
  updateMission: (id: string, data: Record<string, unknown>) =>
    request<{ mission: unknown }>(`/manager/missions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  publishMission: (id: string) =>
    request<{ mission: unknown }>(`/manager/missions/${id}/publish`, { method: 'POST' }),
  assignWorker: (id: string, workerId: string) =>
    request<{ contract: unknown }>(`/manager/missions/${id}/assign`, { method: 'POST', body: JSON.stringify({ workerId }) }),

  applications: () => request<{ applications: unknown[] }>('/manager/applications'),
  acceptApplication: (id: string) =>
    request<{ contract: unknown }>(`/manager/applications/${id}/accept`, { method: 'POST' }),
  rejectApplication: (id: string) =>
    request<unknown>(`/manager/applications/${id}/reject`, { method: 'POST' }),

  workers: () => request<{ workers: unknown[] }>('/manager/workers'),
  workerDetail: (id: string) => request<{ worker: unknown }>(`/manager/workers/${id}`),

  timeDeclarations: () => request<{ declarations: unknown[] }>('/manager/time-declarations'),
  approveDeclaration: (id: string) =>
    request<{ declaration: unknown }>(`/manager/time-declarations/${id}/approve`, { method: 'POST' }),
  rejectDeclaration: (id: string, reason?: string) =>
    request<unknown>(`/manager/time-declarations/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),

  companies: () => request<{ companies: unknown[] }>('/manager/companies'),

  punches: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ punches: unknown[] }>(`/manager/punches${query}`);
  },

  reports: () => request<{ reports: unknown[] }>('/manager/reports'),
  createReport: (data: { missionId: string; content: string }) =>
    request<{ report: unknown }>('/manager/reports', { method: 'POST', body: JSON.stringify(data) }),
};
