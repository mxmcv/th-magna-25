// Mock data for development
// This file contains sample data used throughout the application
// In production, this would be replaced with API calls

export const mockRounds = [
  {
    id: '1',
    name: 'Seed Round',
    target: 5000000,
    raised: 3200000,
    minContribution: 10000,
    maxContribution: 100000,
    participants: 28,
    status: 'active',
    acceptedTokens: ['USDC', 'USDT'],
    startDate: '2025-09-01',
    endDate: '2025-11-30',
  },
  {
    id: '2',
    name: 'Series A',
    target: 10000000,
    raised: 1000000,
    minContribution: 50000,
    maxContribution: 500000,
    participants: 5,
    status: 'active',
    acceptedTokens: ['USDC', 'USDT'],
    startDate: '2025-10-01',
    endDate: '2025-12-31',
  },
  {
    id: '3',
    name: 'Pre-Seed',
    target: 1000000,
    raised: 1000000,
    minContribution: 5000,
    maxContribution: 50000,
    participants: 14,
    status: 'completed',
    acceptedTokens: ['USDC'],
    startDate: '2025-06-01',
    endDate: '2025-08-31',
  },
];

export const mockInvestors = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    totalInvested: 150000,
    activeRounds: 2,
    joinedDate: '2025-09-15',
    kycStatus: 'verified',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    totalInvested: 250000,
    activeRounds: 1,
    joinedDate: '2025-08-20',
    kycStatus: 'verified',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mchen@example.com',
    totalInvested: 75000,
    activeRounds: 1,
    joinedDate: '2025-09-28',
    kycStatus: 'pending',
    status: 'active',
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    totalInvested: 0,
    activeRounds: 0,
    joinedDate: '2025-10-01',
    kycStatus: 'pending',
    status: 'invited',
  },
];

export const mockRecentActivity = [
  {
    id: '1',
    investor: 'John Smith',
    amount: 50000,
    round: 'Seed Round',
    time: '2 hours ago',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    investor: 'Sarah Johnson',
    amount: 75000,
    round: 'Series A',
    time: '5 hours ago',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    investor: 'Mike Chen',
    amount: 25000,
    round: 'Seed Round',
    time: '1 day ago',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockInvestorRounds = [
  {
    id: '1',
    name: 'Seed Round',
    target: 5000000,
    raised: 3200000,
    myContribution: 50000,
    maxContribution: 100000,
    status: 'active',
    endDate: '2025-11-30',
    participants: 28,
  },
  {
    id: '2',
    name: 'Series A',
    target: 10000000,
    raised: 1000000,
    myContribution: 0,
    maxContribution: 500000,
    status: 'active',
    endDate: '2025-12-31',
    participants: 5,
  },
];

export const mockInvestorHistory = [
  {
    id: '1',
    roundName: 'Pre-Seed',
    amount: 25000,
    token: 'USDC',
    date: '2025-08-15',
    status: 'completed',
    transactionHash: '0x1234...5678',
  },
  {
    id: '2',
    roundName: 'Seed Round',
    amount: 50000,
    token: 'USDT',
    date: '2025-09-20',
    status: 'active',
    transactionHash: '0x9876...4321',
  },
];

export const mockDashboardStats = {
  company: {
    totalRaised: 4200000,
    totalRaisedChange: '+12.5%',
    activeRounds: 2,
    activeRoundsInfo: '1 ending soon',
    totalInvestors: 47,
    totalInvestorsChange: '+8 this month',
  },
  investor: {
    totalInvested: 75000,
    totalInvestedInfo: 'Across 2 rounds',
    activeRounds: 2,
    activeRoundsInfo: '1 ending soon',
    completedRounds: 1,
    completedRoundsInfo: 'Pre-Seed',
  },
};

