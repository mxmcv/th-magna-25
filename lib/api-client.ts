/**
 * centralized API client - all frontend network calls go through here
 * benefits: consistent error handling, automatic cookie inclusion, typed responses
 * makes it easy to add retry logic or request interceptors later
 */

import type {
  Round,
  Investor,
  Contribution,
  CreateRoundRequest,
  UpdateRoundRequest,
  CreateInvestorRequest,
  UpdateInvestorRequest,
  CreateContributionRequest,
  InvitationRequest,
  LoginRequest,
  AuthSession,
} from './types';

/**
 * Base API client class with common request handling
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * core request method - wraps fetch with our API conventions
   * credentials: 'include' is critical - sends session cookie on every request
   * returns just the error message (not full error object) to avoid Next.js dev overlay
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // sends session cookie automatically
      });

      const data = await response.json();

      if (!data.success) {
        // Return rejected promise with just the message
        // This prevents Next.js error overlay from triggering
        return Promise.reject(data.error?.message || 'An error occurred');
      }

      return data.data as T;
    } catch (error) {
      // Network errors or JSON parse errors
      if (error instanceof Error) {
        return Promise.reject(error.message);
      }
      return Promise.reject(String(error));
    }
  }

  /**
   * GET request helper
   */
  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  private post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request helper
   */
  private patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request helper
   */
  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication endpoints
  auth = {
    /**
     * Login to the platform
     */
    login: (data: LoginRequest) => this.post<AuthSession>('/api/auth/login', data),
    
    /**
     * Logout from the platform
     */
    logout: () => this.post<{ success: boolean }>('/api/auth/logout'),
    
    /**
     * Get current user session
     */
    me: () => this.get<AuthSession>('/api/auth/me'),
  };

  // Rounds endpoints
  rounds = {
    /**
     * List all rounds (filtered by user type)
     */
    list: () => this.get<Round[]>('/api/rounds'),
    
    /**
     * Get a specific round by ID
     */
    get: (id: string) => this.get<Round>(`/api/rounds/${id}`),
    
    /**
     * Create a new fundraising round
     */
    create: (data: CreateRoundRequest) => this.post<Round>('/api/rounds', data),
    
    /**
     * Update an existing round
     */
    update: (id: string, data: UpdateRoundRequest) => this.patch<Round>(`/api/rounds/${id}`, data),
    
    /**
     * Delete a round
     */
    delete: (id: string) => this.delete<{ success: boolean }>(`/api/rounds/${id}`),
    
    /**
     * Close a fundraising round
     */
    close: (id: string) => this.post<Round>(`/api/rounds/${id}/close`),
  };

  // Investors endpoints
  investors = {
    /**
     * List all investors
     */
    list: () => this.get<Investor[]>('/api/investors'),
    
    /**
     * Get a specific investor by ID
     */
    get: (id: string) => this.get<Investor>(`/api/investors/${id}`),
    
    /**
     * Create a new investor
     */
    create: (data: CreateInvestorRequest) => this.post<Investor>('/api/investors', data),
    
    /**
     * Update an existing investor
     */
    update: (id: string, data: UpdateInvestorRequest) => this.patch<Investor>(`/api/investors/${id}`, data),
    
    /**
     * Delete an investor
     */
    delete: (id: string) => this.delete<{ message: string }>(`/api/investors/${id}`),
  };

  // Contributions endpoints
  contributions = {
    /**
     * List all contributions (filtered by user type)
     */
    list: () => this.get<Contribution[]>('/api/contributions'),
    
    /**
     * Create a new contribution
     */
    create: (data: CreateContributionRequest) => this.post<Contribution>('/api/contributions', data),
    
    /**
     * Confirm a contribution (company only)
     */
    confirm: (id: string) => this.post<Contribution>(`/api/contributions/${id}/confirm`),
  };

  // Invitations endpoints
  invitations = {
    /**
     * Send invitation(s) to investor(s)
     */
    send: (data: InvitationRequest) => this.post<{ invitations: Array<{ id: string; invitationLink: string }> }>('/api/invitations', data),
  };
}

// Export singleton instance
const apiClient = new ApiClient();

export const { auth, rounds, investors, contributions, invitations } = apiClient;
