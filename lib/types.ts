// Type definitions for the Magna Fundraising Platform
// These match the Prisma schema and provide type safety across the application

export type RoundStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'COMPLETED';
export type InvestorStatus = 'INVITED' | 'ACTIVE' | 'INACTIVE';
export type ContributionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type InvitationStatus = 'SENT' | 'VIEWED' | 'ACCEPTED' | 'DECLINED';
export type UserType = 'company' | 'investor';

// Core Models
export interface Round {
  id: string;
  name: string;
  companyId: string;
  description?: string;
  target: number;
  raised: number;
  minContribution: number;
  maxContribution: number;
  status: RoundStatus;
  acceptedTokens: string[];
  startDate: Date | string;
  endDate: Date | string;
  participants?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Investor {
  id: string;
  email: string;
  name: string;
  password?: string;
  walletAddress?: string;
  joinedDate: Date | string;
  status: InvestorStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Contribution {
  id: string;
  roundId: string;
  investorId: string;
  amount: number;
  token: string;
  status: ContributionStatus;
  transactionHash?: string;
  walletAddress?: string;
  contributedAt: Date | string;
  confirmedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Invitation {
  id: string;
  roundId: string;
  investorId: string;
  token: string;
  expiresAt: Date | string;
  status: InvitationStatus;
  sentAt: Date | string;
  respondedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Company {
  id: string;
  email: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Extended types with relations
export interface RoundWithStats extends Round {
  _count?: {
    contributions: number;
    invitations: number;
  };
}

export interface RoundWithContributions extends Round {
  contributions: ContributionWithDetails[];
  invitations?: Invitation[];
}

export interface InvestorWithStats extends Investor {
  totalContributed?: number;
  activeRounds?: number;
  contributions?: Contribution[];
}

export interface InvestorWithContributions extends Investor {
  contributions: Contribution[];
  invitations?: Invitation[];
}

export interface ContributionWithDetails extends Contribution {
  round?: Round;
  investor?: Investor;
}

export interface RoundWithInvestor extends Round {
  myContribution?: number;
}

// API Request/Response types
export interface CreateRoundRequest {
  name: string;
  description?: string;
  target: number;
  minContribution: number;
  maxContribution: number;
  acceptedTokens: string[];
  startDate: string;
  endDate: string;
}

export interface UpdateRoundRequest extends Partial<CreateRoundRequest> {
  status?: RoundStatus;
  raised?: number;
}

export interface CreateInvestorRequest {
  email: string;
  name: string;
  walletAddress?: string;
}

export interface UpdateInvestorRequest extends Partial<CreateInvestorRequest> {
  status?: InvestorStatus;
}

export interface CreateContributionRequest {
  roundId: string;
  amount: number;
  token: string;
  walletAddress?: string;
}

export interface UpdateContributionRequest {
  status?: ContributionStatus;
  transactionHash?: string;
  confirmedAt?: string;
}

export interface InvitationRequest {
  investorId: string;
  roundIds: string[];
}

// Dashboard statistics types
export interface DashboardStats {
  totalRaised: number;
  totalRaisedChange?: string;
  activeRounds: number;
  activeRoundsInfo?: string;
  totalInvestors: number;
  totalInvestorsChange?: string;
}

export interface InvestorDashboardStats {
  totalInvested: number;
  totalInvestedInfo?: string;
  activeRounds: number;
  activeRoundsInfo?: string;
  completedRounds: number;
  completedRoundsInfo?: string;
}

// Auth types
export interface AuthSession {
  userId: string;
  userType: UserType;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  userType: UserType;
}

// Filter and search types
export interface InvestorFilters {
  search?: string;
  status?: InvestorStatus | 'all';
  round?: string | 'all';
}

export interface RoundFilters {
  search?: string;
  status?: RoundStatus | 'all';
}
