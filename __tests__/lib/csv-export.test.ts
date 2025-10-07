import {
  exportDashboardToCSV,
  prepareDashboardExportData,
  DashboardExportData,
} from '@/lib/csv-export';

// Mock document and URL for browser APIs
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

describe('csv-export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock DOM APIs
    mockCreateElement.mockReturnValue({
      setAttribute: jest.fn(),
      click: mockClick,
      style: {},
      download: '',
    });
    
    global.document.createElement = mockCreateElement;
    global.document.body.appendChild = mockAppendChild;
    global.document.body.removeChild = mockRemoveChild;
    
    global.URL.createObjectURL = mockCreateObjectURL.mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    global.Blob = jest.fn().mockImplementation((content, options) => ({
      content,
      options,
    })) as any;
  });

  describe('prepareDashboardExportData', () => {
    it('should calculate statistics correctly', () => {
      const rounds = [
        {
          id: '1',
          name: 'Round A',
          status: 'ACTIVE',
          raised: 100000,
          target: 200000,
          participants: 5,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          minContribution: 1000,
          maxContribution: 50000,
          acceptedTokens: ['USDC', 'ETH'],
        },
        {
          id: '2',
          name: 'Round B',
          status: 'COMPLETED',
          raised: 250000,
          target: 250000,
          participants: 10,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          minContribution: 5000,
          maxContribution: 100000,
          acceptedTokens: ['USDC'],
        },
        {
          id: '3',
          name: 'Round C',
          status: 'ACTIVE',
          raised: 50000,
          target: 100000,
          participants: 3,
          startDate: '2025-06-01',
          endDate: '2025-12-31',
          minContribution: 2000,
          maxContribution: 25000,
          acceptedTokens: ['ETH'],
        },
      ];

      const recentActivity = [
        { id: '1', investor: 'Alice', amount: 10000, round: 'Round A', time: '2 hours ago' },
        { id: '2', investor: 'Bob', amount: 15000, round: 'Round A', time: '5 hours ago' },
        { id: '3', investor: 'Alice', amount: 20000, round: 'Round C', time: '1 day ago' },
      ];

      const result = prepareDashboardExportData(rounds, recentActivity);

      expect(result.stats.totalRaised).toBe(400000);
      expect(result.stats.activeRoundsCount).toBe(2);
      expect(result.stats.completedRoundsCount).toBe(1);
      expect(result.stats.totalRoundsCount).toBe(3);
      expect(result.stats.totalInvestors).toBe(2); // Alice and Bob
      expect(result.rounds).toEqual(rounds);
      expect(result.recentActivity).toEqual(recentActivity);
    });

    it('should handle empty data', () => {
      const result = prepareDashboardExportData([], []);

      expect(result.stats.totalRaised).toBe(0);
      expect(result.stats.activeRoundsCount).toBe(0);
      expect(result.stats.completedRoundsCount).toBe(0);
      expect(result.stats.totalRoundsCount).toBe(0);
      expect(result.stats.totalInvestors).toBe(0);
      expect(result.rounds).toEqual([]);
      expect(result.recentActivity).toEqual([]);
    });

    it('should handle CLOSED status as completed', () => {
      const rounds = [
        {
          id: '1',
          name: 'Round A',
          status: 'CLOSED',
          raised: 100000,
          target: 200000,
          participants: 5,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          minContribution: 1000,
          maxContribution: 50000,
          acceptedTokens: ['USDC'],
        },
      ];

      const result = prepareDashboardExportData(rounds, []);

      expect(result.stats.completedRoundsCount).toBe(1);
      expect(result.stats.activeRoundsCount).toBe(0);
    });

    it('should handle duplicate investors in activity', () => {
      const recentActivity = [
        { id: '1', investor: 'Alice', amount: 10000, round: 'Round A', time: '2 hours ago' },
        { id: '2', investor: 'Alice', amount: 15000, round: 'Round B', time: '5 hours ago' },
        { id: '3', investor: 'Alice', amount: 20000, round: 'Round A', time: '1 day ago' },
      ];

      const result = prepareDashboardExportData([], recentActivity);

      expect(result.stats.totalInvestors).toBe(1); // Only Alice
    });
  });

  describe('exportDashboardToCSV', () => {
    it('should trigger download with correct filename', () => {
      const data: DashboardExportData = {
        rounds: [
          {
            id: '1',
            name: 'Round A',
            status: 'ACTIVE',
            raised: 100000,
            target: 200000,
            participants: 5,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            minContribution: 1000,
            maxContribution: 50000,
            acceptedTokens: ['USDC', 'ETH'],
          },
        ],
        recentActivity: [
          { id: '1', investor: 'Alice', amount: 10000, round: 'Round A', time: '2 hours ago' },
        ],
        stats: {
          totalRaised: 100000,
          activeRoundsCount: 1,
          totalInvestors: 1,
          totalRoundsCount: 1,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      // Verify Blob was created with CSV content
      expect(global.Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'text/csv;charset=utf-8;' }
      );

      // Verify link element was created and clicked
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should generate CSV with correct structure and headers', () => {
      const data: DashboardExportData = {
        rounds: [
          {
            id: '1',
            name: 'Test Round',
            status: 'ACTIVE',
            raised: 150000,
            target: 300000,
            participants: 8,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            minContribution: 5000,
            maxContribution: 50000,
            acceptedTokens: ['USDC', 'ETH'],
          },
        ],
        recentActivity: [
          { id: '1', investor: 'John Doe', amount: 25000, round: 'Test Round', time: '1 hour ago' },
        ],
        stats: {
          totalRaised: 150000,
          activeRoundsCount: 1,
          totalInvestors: 1,
          totalRoundsCount: 1,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      // Get the CSV content from the Blob mock
      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];

      // Verify sections exist
      expect(blobContent).toContain('DASHBOARD SUMMARY');
      expect(blobContent).toContain('ACTIVE ROUNDS');
      expect(blobContent).toContain('ALL ROUNDS SUMMARY');
      expect(blobContent).toContain('RECENT ACTIVITY');

      // Verify headers
      expect(blobContent).toContain('Metric,Value');
      expect(blobContent).toContain('Round Name,Status,Raised,Target,Progress');
      expect(blobContent).toContain('Investor,Round,Amount,Time');

      // Verify data
      expect(blobContent).toContain('Total Raised');
      expect(blobContent).toContain('Active Rounds,1');
      expect(blobContent).toContain('Test Round');
      expect(blobContent).toContain('John Doe');
    });

    it('should handle empty rounds gracefully', () => {
      const data: DashboardExportData = {
        rounds: [],
        recentActivity: [],
        stats: {
          totalRaised: 0,
          activeRoundsCount: 0,
          totalInvestors: 0,
          totalRoundsCount: 0,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];

      expect(blobContent).toContain('No active rounds');
      expect(blobContent).toContain('No rounds');
      expect(blobContent).toContain('No recent activity');
    });

    it('should escape special characters in CSV fields', () => {
      const data: DashboardExportData = {
        rounds: [
          {
            id: '1',
            name: 'Round "A", Part 1',
            status: 'ACTIVE',
            raised: 100000,
            target: 200000,
            participants: 5,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            minContribution: 1000,
            maxContribution: 50000,
            acceptedTokens: ['USDC'],
          },
        ],
        recentActivity: [
          {
            id: '1',
            investor: 'Smith, John',
            amount: 10000,
            round: 'Round "A", Part 1',
            time: '2 hours ago',
          },
        ],
        stats: {
          totalRaised: 100000,
          activeRoundsCount: 1,
          totalInvestors: 1,
          totalRoundsCount: 1,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];

      // Verify special characters are properly escaped
      expect(blobContent).toContain('"Round ""A"", Part 1"');
      expect(blobContent).toContain('"Smith, John"');
    });

    it('should format currency values correctly', () => {
      const data: DashboardExportData = {
        rounds: [
          {
            id: '1',
            name: 'Round A',
            status: 'ACTIVE',
            raised: 1500000,
            target: 3000000,
            participants: 10,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            minContribution: 10000,
            maxContribution: 500000,
            acceptedTokens: ['USDC'],
          },
        ],
        recentActivity: [],
        stats: {
          totalRaised: 1500000,
          activeRoundsCount: 1,
          totalInvestors: 0,
          totalRoundsCount: 1,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];

      // Verify currency formatting is applied
      expect(blobContent).toContain('$1,500,000');
      expect(blobContent).toContain('$3,000,000');
    });

    it('should include percentage progress calculation', () => {
      const data: DashboardExportData = {
        rounds: [
          {
            id: '1',
            name: 'Round A',
            status: 'ACTIVE',
            raised: 75000,
            target: 100000,
            participants: 5,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            minContribution: 1000,
            maxContribution: 50000,
            acceptedTokens: ['USDC'],
          },
        ],
        recentActivity: [],
        stats: {
          totalRaised: 75000,
          activeRoundsCount: 1,
          totalInvestors: 0,
          totalRoundsCount: 1,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];

      // Verify percentage is calculated correctly (75000/100000 = 75%)
      expect(blobContent).toContain('75%');
    });

    it('should handle multiple accepted tokens', () => {
      const data: DashboardExportData = {
        rounds: [
          {
            id: '1',
            name: 'Round A',
            status: 'ACTIVE',
            raised: 100000,
            target: 200000,
            participants: 5,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            minContribution: 1000,
            maxContribution: 50000,
            acceptedTokens: ['USDC', 'ETH', 'DAI'],
          },
        ],
        recentActivity: [],
        stats: {
          totalRaised: 100000,
          activeRoundsCount: 1,
          totalInvestors: 0,
          totalRoundsCount: 1,
          completedRoundsCount: 0,
        },
      };

      exportDashboardToCSV(data);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];

      // Verify tokens are joined with semicolons
      expect(blobContent).toContain('USDC; ETH; DAI');
    });
  });
});

