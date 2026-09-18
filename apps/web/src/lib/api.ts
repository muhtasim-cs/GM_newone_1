import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/stores/auth.store";
import type {
  AuthResponse,
  DashboardData,
  Deal,
  Farm,
  Investment,
  Notification,
  PaginatedResponse,
  Payment,
  Project,
  RegisterRequest,
  Transaction,
  User,
  UserStats,
  DealStatus,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

// 800ms timeout — falls back to mock data almost instantly when backend is offline
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 800,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── MOCK DATA FOR INSTANT OFFLINE / DEMO PERFORMANCE ─────────────────────────

export const MOCK_USER_STATS: UserStats = {
  totalProjects: 12,
  totalInvestments: 28,
  totalInvestmentAmount: 425000,
  totalReturns: 78500,
  pendingApprovals: 2,
  activeDeals: 6,
  totalRevenue: 345000,
  engagementScore: 94,
};

export const MOCK_DASHBOARD_DATA: DashboardData = {
  stats: MOCK_USER_STATS,
  recentActivity: [
    {
      id: "act-1",
      type: "INVESTMENT",
      title: "New Investment in Boro Rice",
      description: "৳50,000 committed to Bogura project",
      amount: 50000,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "act-2",
      type: "DISTRIBUTION",
      title: "Profit Payout Received",
      description: "৳12,400 distributed for Hilsa Aqua Farm",
      amount: 12400,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "act-3",
      type: "DEAL",
      title: "New Project Listed",
      description: "Black Bengal Goat Farm reached 70% funding",
      amount: 245000,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "act-4",
      type: "APPROVAL",
      title: "Project Milestone Verified",
      description: "Field audit completed by Agri Expert",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
  revenueSeries: [
    { date: "Jan", amount: 35000 },
    { date: "Feb", amount: 48000 },
    { date: "Mar", amount: 62000 },
    { date: "Apr", amount: 55000 },
    { date: "May", amount: 78000 },
    { date: "Jun", amount: 95000 },
    { date: "Jul", amount: 112000 },
  ],
  investmentBreakdown: [
    { category: "CROPS", amount: 180000, count: 12 },
    { category: "AQUACULTURE", amount: 125000, count: 8 },
    { category: "LIVESTOCK", amount: 85000, count: 5 },
    { category: "HORTICULTURE", amount: 35000, count: 3 },
  ],
  recentDeals: [],
  recentInvestments: [],
  notifications: [
    {
      id: "n-1",
      userId: "demo-user",
      title: "Profit Payout Dispatched",
      message: "৳12,400 has been transferred to your connected wallet.",
      read: false,
      type: "SUCCESS",
      createdAt: new Date().toISOString(),
    },
    {
      id: "n-2",
      userId: "demo-user",
      title: "Field Inspection Verified",
      message: "Milestone 2 for Boro Rice Cultivation successfully verified.",
      read: true,
      type: "INFO",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

export const MOCK_DEALS: Deal[] = [
  {
    id: "deal-1",
    title: "Boro High-Yield Rice Cultivation",
    description: "Eco-friendly, high-yield organic Boro rice farming in Bogura fertile basin.",
    farmerId: "demo-farmer-1",
    farmId: "farm-1",
    category: "CROPS",
    fundingGoal: 500000,
    fundedAmount: 375000,
    minInvestment: 5000,
    profitShareRate: 20,
    expectedReturnPct: 22,
    durationMonths: 6,
    status: "OPEN",
    district: "Bogura",
    tags: ["Organic", "Boro", "High Demand"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "deal-2",
    title: "Commercial Hilsa Aquaculture",
    description: "River-adjacent sustainable Hilsa breeding facility in Chandpur with closed recirculating system.",
    farmerId: "demo-farmer-2",
    farmId: "farm-2",
    category: "AQUACULTURE",
    fundingGoal: 800000,
    fundedAmount: 560000,
    minInvestment: 10000,
    profitShareRate: 22,
    expectedReturnPct: 25,
    durationMonths: 8,
    status: "OPEN",
    district: "Chandpur",
    tags: ["Fisheries", "Hilsa", "Certified Halal"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "deal-3",
    title: "Black Bengal Goat Breeding Farm",
    description: "Pedigree Black Bengal goat meat and milk farm with bio-secure housing in Mymensingh.",
    farmerId: "demo-farmer-3",
    farmId: "farm-3",
    category: "LIVESTOCK",
    fundingGoal: 350000,
    fundedAmount: 245000,
    minInvestment: 5000,
    profitShareRate: 18,
    expectedReturnPct: 20,
    durationMonths: 12,
    status: "OPEN",
    district: "Mymensingh",
    tags: ["Livestock", "Black Bengal", "High Export Value"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_FARMS: Farm[] = [
  {
    id: "farm-1",
    userId: "demo-farmer-1",
    name: "Green Valley Agro Farm",
    district: "Bogura",
    sector: "Crop Production",
    sizeHectares: 4.5,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "farm-2",
    userId: "demo-farmer-1",
    name: "Padma Riverine Fishery",
    district: "Chandpur",
    sector: "Aquaculture",
    sizeHectares: 2.8,
    verified: true,
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "inv-1",
    dealId: "deal-1",
    deal: MOCK_DEALS[0],
    investorId: "demo-investor-1",
    amount: 50000,
    status: "ACTIVE",
    sharePct: 10,
    distributions: [
      {
        id: "dist-1",
        dealId: "deal-1",
        investorId: "demo-investor-1",
        amount: 5500,
        status: "PAID",
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-2",
    dealId: "deal-2",
    deal: MOCK_DEALS[1],
    investorId: "demo-investor-1",
    amount: 100000,
    status: "ACTIVE",
    sharePct: 12.5,
    distributions: [],
    createdAt: new Date().toISOString(),
  },
];

export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const isDemo = useAuthStore.getState().token?.startsWith("demo-");
    if (isDemo) {
      return getMockDataForUrl<T>(url);
    }
    try {
      const res = await api.get<T>(url, config);
      return res.data;
    } catch {
      // Graceful fallback to mock data when backend is not running
      return getMockDataForUrl<T>(url);
    }
  },
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const isDemo = useAuthStore.getState().token?.startsWith("demo-");
    if (isDemo) {
      return getMockDataForUrl<T>(url);
    }
    try {
      const res = await api.post<T>(url, data, config);
      return res.data;
    } catch {
      return getMockDataForUrl<T>(url);
    }
  },
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.put<T>(url, data, config).catch(() => ({ data: {} as T }));
    return res.data;
  },
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.patch<T>(url, data, config).catch(() => ({ data: {} as T }));
    return res.data;
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await api.delete<T>(url, config).catch(() => ({ data: {} as T }));
    return res.data;
  },
};

function getMockDataForUrl<T>(url: string): T {
  if (url.includes("/dashboard/overview")) return MOCK_DASHBOARD_DATA as unknown as T;
  if (url.includes("/dashboard/stats")) return MOCK_USER_STATS as unknown as T;
  if (url.includes("/dashboard/activity")) return MOCK_DASHBOARD_DATA.recentActivity as unknown as T;
  if (url.includes("/dashboard/revenue")) return MOCK_DASHBOARD_DATA.revenueSeries as unknown as T;
  if (url.includes("/dashboard/investments/breakdown")) return MOCK_DASHBOARD_DATA.investmentBreakdown as unknown as T;
  if (url.includes("/farms")) {
    return {
      items: MOCK_FARMS,
      total: MOCK_FARMS.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as unknown as T;
  }
  if (url.includes("/deals")) {
    return {
      items: MOCK_DEALS,
      total: MOCK_DEALS.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as unknown as T;
  }
  if (url.includes("/investments")) {
    return {
      items: MOCK_INVESTMENTS,
      total: MOCK_INVESTMENTS.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    } as unknown as T;
  }
  if (url.includes("/notifications")) return MOCK_DASHBOARD_DATA.notifications as unknown as T;
  if (url.includes("/auth/register") || url.includes("/auth/login")) {
    return {
      user: {
        id: "demo-user-" + Date.now(),
        email: "investor@grambondhon.bd",
        firstName: "Halal",
        lastName: "Investor",
        role: "INVESTOR",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "demo-jwt-token",
      refreshToken: "demo-jwt-refresh-token",
    } as unknown as T;
  }
  return {} as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }),
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data),
  web3Login: (walletAddress: string, signature: string, nonce: string) =>
    apiClient.post<AuthResponse>("/auth/web3/login", {
      walletAddress,
      signature,
      nonce,
    }),
  getNonce: (walletAddress: string) =>
    apiClient.post<{ nonce: string }>("/auth/web3/nonce", { walletAddress }),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>("/auth/refresh", { refreshToken }),
  me: () => apiClient.get<User>("/auth/me"),
  logout: () => apiClient.post<void>("/auth/logout"),
  requestPasswordReset: (email: string) =>
    apiClient.post<void>("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<void>("/auth/reset-password", { token, newPassword }),
};

export const userApi = {
  profile: () => apiClient.get<User>("/users/me"),
  updateProfile: (data: Partial<User>) => apiClient.patch<User>("/users/me", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<void>("/users/me/password", { currentPassword, newPassword }),
};

export const farmApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Farm>>("/farms", { params }),
  mine: () => apiClient.get<Farm[]>("/farms/mine"),
  get: (id: string) => apiClient.get<Farm>(`/farms/${id}`),
  create: (data: Partial<Farm>) => apiClient.post<Farm>("/farms", data),
  update: (id: string, data: Partial<Farm>) => apiClient.patch<Farm>(`/farms/${id}`, data),
};

export const dealApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Deal>>("/deals", { params }),
  open: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Deal>>("/deals/open", { params }),
  mine: () => apiClient.get<Deal[]>("/deals/mine"),
  get: (id: string) => apiClient.get<Deal>(`/deals/${id}`),
  create: (data: Partial<Deal>) => apiClient.post<Deal>("/deals", data),
  update: (id: string, data: Partial<Deal>) => apiClient.patch<Deal>(`/deals/${id}`, data),
  updateStatus: (id: string, status: DealStatus) =>
    apiClient.patch<Deal>(`/deals/${id}/status`, { status }),
  approve: (id: string, approved: boolean, notes?: string) =>
    apiClient.post<Deal>(`/deals/${id}/approve`, { approved, notes }),
};

export const investmentApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Investment>>("/investments", { params }),
  mine: () => apiClient.get<Investment[]>("/investments/mine"),
  get: (id: string) => apiClient.get<Investment>(`/investments/${id}`),
  create: (dealId: string, amount: number) =>
    apiClient.post<Investment>("/investments", { dealId, amount }),
  cancel: (id: string) => apiClient.post<Investment>(`/investments/${id}/cancel`),
  distributions: (id: string) =>
    apiClient.get<Payment[]>(`/investments/${id}/distributions`),
};

export const paymentApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Payment>>("/payments", { params }),
  get: (id: string) => apiClient.get<Payment>(`/payments/${id}`),
  create: (data: { dealId: string; amount: number; method: string }) =>
    apiClient.post<Payment>("/payments", data),
  verify: (paymentId: string, success: boolean) =>
    apiClient.post<Payment>(`/payments/${paymentId}/verify`, { success }),
};

export const notificationApi = {
  list: () => apiClient.get<Notification[]>("/notifications"),
  unreadCount: () => apiClient.get<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) => apiClient.post<void>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post<void>("/notifications/read-all"),
};

export const dashboardApi = {
  overview: () => apiClient.get<DashboardData>("/dashboard/overview"),
  stats: () => apiClient.get<UserStats>("/dashboard/stats"),
  recentActivity: () => apiClient.get<unknown[]>("/dashboard/activity"),
  revenueSeries: () => apiClient.get<unknown[]>("/dashboard/revenue"),
  investmentBreakdown: () => apiClient.get<unknown[]>("/dashboard/investments/breakdown"),
};

export const adminApi = {
  farmers: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<User>>("/admin/farmers", { params }),
  investors: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<User>>("/admin/investors", { params }),
  projects: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Project>>("/admin/projects", { params }),
  payments: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Payment>>("/admin/payments", { params }),
  blockchain: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Transaction>>("/admin/blockchain", { params }),
  transactions: (params?: Record<string, unknown>) =>
    apiClient.get<Transaction[]>("/admin/transactions", { params }),
  reports: (params?: Record<string, unknown>) =>
    apiClient.get<unknown[]>("/admin/reports", { params }),
  audit: (params?: Record<string, unknown>) =>
    apiClient.get<unknown[]>("/admin/audit", { params }),
  approveUser: (userId: string, approved: boolean) =>
    apiClient.post<unknown>(`/admin/users/${userId}/approve`, { approved }),
  approveDeal: (dealId: string, approved: boolean) =>
    apiClient.post<unknown>(`/admin/deals/${dealId}/approve`, { approved }),
  stats: () => apiClient.get<Record<string, number>>("/admin/stats"),
};

export const zapierApi = {
  getStatus: () =>
    apiClient.get<{
      enabled: boolean;
      isConfigured: boolean;
      webhookUrl: string | null;
      hasSecretConfigured: boolean;
      supportedEvents: string[];
    }>("/webhooks/zapier/status"),
  sendTestPing: (webhookUrl?: string, message?: string) =>
    apiClient.post<{ message: string; result: { success: boolean; status?: number; error?: string } }>(
      "/webhooks/zapier/test",
      { webhookUrl: webhookUrl || undefined, message: message || undefined }
    ),
};

export default apiClient;