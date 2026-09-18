export type Role = "FARMER" | "INVESTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  avatar?: string;
  businessName?: string;
  district?: string;
  investorType?: string;
  companyName?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  businessName?: string;
  district?: string;
  investorType?: string;
  companyName?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type DealStatus =
  | "DRAFT"
  | "PENDING"
  | "OPEN"
  | "FUNDED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type DealCategory =
  | "CROPS"
  | "LIVESTOCK"
  | "HORTICULTURE"
  | "AQUACULTURE"
  | "EQUIPMENT"
  | "AGROFORESTRY"
  | "OTHER";

export interface Farm {
  id: string;
  userId: string;
  name: string;
  district: string;
  sector: string;
  sizeHectares: number;
  verified: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  farmerId: string;
  farmer?: User;
  farmId: string;
  category: DealCategory;
  fundingGoal: number;
  fundedAmount: number;
  minInvestment: number;
  profitShareRate: number;
  expectedReturnPct: number;
  durationMonths: number;
  status: DealStatus;
  documents?: string[];
  media?: string[];
  district: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Distribution {
  id: string;
  dealId: string;
  investorId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  transactionHash?: string;
  paidAt?: string;
  createdAt: string;
}

export type InvestmentStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Investment {
  id: string;
  dealId: string;
  deal?: Deal;
  investorId: string;
  amount: number;
  status: InvestmentStatus;
  sharePct: number;
  distributions: Distribution[];
  createdAt: string;
}

export interface Payment {
  id: string;
  dealId: string;
  investorId: string;
  amount: number;
  currency: string;
  type: "INVESTMENT" | "DISTRIBUTION" | "WITHDRAWAL" | "FEE";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  method: "CARD" | "BANK" | "WALLET";
  reference: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  FarmerId: string;
  farmId: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  invested: number;
  status: string;
  startsAt?: string;
  endsAt?: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  hash: string;
  type: string;
  blockNumber: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  createdAt: string;
}

export interface UserStats {
  totalProjects: number;
  totalInvestments: number;
  totalInvestmentAmount: number;
  totalReturns: number;
  pendingApprovals: number;
  activeDeals: number;
  totalRevenue: number;
  engagementScore: number;
}

export interface RevenuePoint {
  date: string;
  amount: number;
  type?: string;
}

export interface InvestmentBreakdown {
  category: DealCategory;
  amount: number;
  count: number;
}

export interface DashboardData {
  stats: UserStats;
  recentActivity: ActivityItem[];
  revenueSeries: RevenuePoint[];
  investmentBreakdown: InvestmentBreakdown[];
  recentDeals: Deal[];
  recentInvestments: Investment[];
  notifications: Notification[];
}

export interface ActivityItem {
  id: string;
  type: "DEAL" | "INVESTMENT" | "DISTRIBUTION" | "PAYMENT" | "APPROVAL" | "SYSTEM";
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}