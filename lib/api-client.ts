// API Client for front-end
// Provides type-safe methods to call backend APIs

import type { Round, Investor, Contribution, Invitation } from './types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'An error occurred');
    }

    return data.data as T;
  }

  // ============================================================================
  // AUTH
  // ============================================================================

  async register(email: string, name: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  async login(email: string, password: string, userType: 'company' | 'investor' = 'company') {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // ============================================================================
  // ROUNDS
  // ============================================================================

  async getRounds() {
    return this.request('/api/rounds');
  }

  async getRound(id: string) {
    return this.request(`/api/rounds/${id}`);
  }

  async createRound(data: {
    name: string;
    description?: string;
    target: number;
    minContribution: number;
    maxContribution: number;
    acceptedTokens: string[];
    startDate: string;
    endDate: string;
    status?: string;
  }) {
    return this.request('/api/rounds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRound(id: string, data: Partial<{
    name: string;
    description: string;
    target: number;
    minContribution: number;
    maxContribution: number;
    acceptedTokens: string[];
    startDate: string;
    endDate: string;
    status: string;
  }>) {
    return this.request(`/api/rounds/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRound(id: string) {
    return this.request(`/api/rounds/${id}`, {
      method: 'DELETE',
    });
  }

  async closeRound(id: string) {
    return this.request(`/api/rounds/${id}/close`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // INVESTORS
  // ============================================================================

  async getInvestors() {
    return this.request('/api/investors');
  }

  async getInvestor(id: string) {
    return this.request(`/api/investors/${id}`);
  }

  async createInvestor(data: {
    email: string;
    name: string;
    walletAddress?: string;
  }) {
    return this.request('/api/investors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvestor(id: string, data: Partial<{
    name: string;
    email: string;
    walletAddress: string;
    status: string;
  }>) {
    return this.request(`/api/investors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // INVITATIONS
  // ============================================================================

  async sendInvitations(roundId: string, investorIds: string[]) {
    return this.request('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ roundId, investorIds }),
    });
  }

  // ============================================================================
  // CONTRIBUTIONS
  // ============================================================================

  async getContributions() {
    return this.request('/api/contributions');
  }

  async createContribution(data: {
    roundId: string;
    amount: number;
    token: string;
    walletAddress?: string;
  }) {
    return this.request('/api/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmContribution(id: string) {
    return this.request(`/api/contributions/${id}/confirm`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const auth = {
  register: (email: string, name: string, password: string) =>
    apiClient.register(email, name, password),
  login: (email: string, password: string, userType?: 'company' | 'investor') =>
    apiClient.login(email, password, userType),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
};

export const rounds = {
  list: () => apiClient.getRounds() as Promise<Round[]>,
  get: (id: string) => apiClient.getRound(id) as Promise<Round>,
  create: (data: Parameters<typeof apiClient.createRound>[0]) =>
    apiClient.createRound(data) as Promise<Round>,
  update: (id: string, data: Parameters<typeof apiClient.updateRound>[1]) =>
    apiClient.updateRound(id, data) as Promise<Round>,
  delete: (id: string) => apiClient.deleteRound(id),
  close: (id: string) => apiClient.closeRound(id) as Promise<Round>,
};

export const investors = {
  list: () => apiClient.getInvestors() as Promise<Investor[]>,
  get: (id: string) => apiClient.getInvestor(id) as Promise<Investor>,
  create: (data: Parameters<typeof apiClient.createInvestor>[0]) =>
    apiClient.createInvestor(data) as Promise<Investor>,
  update: (id: string, data: Parameters<typeof apiClient.updateInvestor>[1]) =>
    apiClient.updateInvestor(id, data) as Promise<Investor>,
};

export const invitations = {
  send: (roundId: string, investorIds: string[]) =>
    apiClient.sendInvitations(roundId, investorIds) as Promise<any>,
};

export const contributions = {
  list: () => apiClient.getContributions() as Promise<Contribution[]>,
  create: (data: Parameters<typeof apiClient.createContribution>[0]) =>
    apiClient.createContribution(data) as Promise<Contribution>,
  confirm: (id: string) => apiClient.confirmContribution(id),
};

