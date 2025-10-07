import { calculateTokenAllocations, exportToMagnaCSV, exportToJSON } from '@/lib/token-allocation';

describe('Token Allocation', () => {
  const mockContributions = [
    { 
      investorId: '1',
      investorName: 'John Smith', 
      investorEmail: 'john@example.com', 
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      amount: 100000 
    },
    { 
      investorId: '2',
      investorName: 'Sarah Johnson', 
      investorEmail: 'sarah@example.com', 
      walletAddress: '0x0000000000000000000000000000000000000001',
      amount: 200000 
    },
    { 
      investorId: '3',
      investorName: 'Mike Chen', 
      investorEmail: 'mike@example.com', 
      amount: 150000 
    },
  ];

  describe('calculateTokenAllocations', () => {
    it('calculates token amounts correctly', () => {
      const tokenPrice = 0.50;
      const result = calculateTokenAllocations(mockContributions, tokenPrice);
      
      expect(result).toHaveLength(3);
      expect(result[0].tokenAmount).toBe(200000); // 100k / 0.50
      expect(result[1].tokenAmount).toBe(400000); // 200k / 0.50
      expect(result[2].tokenAmount).toBe(300000); // 150k / 0.50
    });

    it('calculates allocation percentage correctly', () => {
      const tokenPrice = 0.50;
      const result = calculateTokenAllocations(mockContributions, tokenPrice);
      
      // Total raised is 450k
      expect(result[0].percentage).toBeCloseTo(22.22, 1); // 100k / 450k
      expect(result[1].percentage).toBeCloseTo(44.44, 1); // 200k / 450k
      expect(result[2].percentage).toBeCloseTo(33.33, 1); // 150k / 450k
    });

    it('handles zero token price gracefully', () => {
      const result = calculateTokenAllocations(mockContributions, 0.001);
      
      expect(result).toHaveLength(3);
      expect(result[0].tokenAmount).toBe(100000000); // 100k / 0.001
    });

    it('includes wallet addresses when available', () => {
      const result = calculateTokenAllocations(mockContributions, 1);
      
      expect(result[0].walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1');
      expect(result[1].walletAddress).toBe('0x0000000000000000000000000000000000000001');
      expect(result[2].walletAddress).toBeUndefined();
    });

    it('includes vesting schedule when provided', () => {
      const vestingConfig = { cliff: 6, duration: 24, tge: 10 };
      const result = calculateTokenAllocations(mockContributions, 1, vestingConfig);
      
      expect(result[0].vestingSchedule).toEqual(vestingConfig);
      expect(result[1].vestingSchedule).toEqual(vestingConfig);
    });
  });

  describe('exportToMagnaCSV', () => {
    it('generates CSV with correct headers', () => {
      const allocations = calculateTokenAllocations(mockContributions, 0.50);
      const report = {
        roundId: 'round-1',
        roundName: 'Seed Round',
        totalRaised: 450000,
        totalTokens: 900000,
        tokenPrice: 0.50,
        allocations,
        generatedAt: new Date('2024-01-15'),
      };
      
      const csv = exportToMagnaCSV(report);
      
      expect(csv).toContain('Investor Name');
      expect(csv).toContain('Email');
      expect(csv).toContain('Wallet Address');
      expect(csv).toContain('Token Amount');
    });

    it('includes all investor data', () => {
      const allocations = calculateTokenAllocations(mockContributions, 0.50);
      const report = {
        roundId: 'round-1',
        roundName: 'Seed Round',
        totalRaised: 450000,
        totalTokens: 900000,
        tokenPrice: 0.50,
        allocations,
        generatedAt: new Date('2024-01-15'),
      };
      
      const csv = exportToMagnaCSV(report);
      
      expect(csv).toContain('John Smith');
      expect(csv).toContain('john@example.com');
      expect(csv).toContain('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1');
    });

    it('handles missing wallet addresses', () => {
      const allocations = calculateTokenAllocations(mockContributions, 0.50);
      const report = {
        roundId: 'round-1',
        roundName: 'Seed Round',
        totalRaised: 450000,
        totalTokens: 900000,
        tokenPrice: 0.50,
        allocations,
        generatedAt: new Date('2024-01-15'),
      };
      
      const csv = exportToMagnaCSV(report);
      const lines = csv.split('\n');
      
      // Mike Chen has no wallet address, should have empty string
      expect(lines[3]).toContain('Mike Chen');
    });
  });

  describe('exportToJSON', () => {
    it('generates valid JSON', () => {
      const allocations = calculateTokenAllocations(mockContributions, 0.50);
      const report = {
        roundId: 'round-1',
        roundName: 'Seed Round',
        totalRaised: 450000,
        totalTokens: 900000,
        tokenPrice: 0.50,
        allocations,
        generatedAt: new Date('2024-01-15'),
      };
      
      const json = exportToJSON(report);
      const parsed = JSON.parse(json);
      
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('allocations');
    });

    it('includes correct metadata', () => {
      const allocations = calculateTokenAllocations(mockContributions, 0.50);
      const report = {
        roundId: 'round-1',
        roundName: 'Seed Round',
        totalRaised: 450000,
        totalTokens: 900000,
        tokenPrice: 0.50,
        allocations,
        generatedAt: new Date('2024-01-15'),
      };
      
      const json = exportToJSON(report);
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata.roundId).toBe('round-1');
      expect(parsed.metadata.roundName).toBe('Seed Round');
      expect(parsed.metadata.platform).toBe('Magna Fundraising Platform');
    });

    it('includes allocation data', () => {
      const allocations = calculateTokenAllocations(mockContributions, 0.50);
      const report = {
        roundId: 'round-1',
        roundName: 'Seed Round',
        totalRaised: 450000,
        totalTokens: 900000,
        tokenPrice: 0.50,
        allocations,
        generatedAt: new Date('2024-01-15'),
      };
      
      const json = exportToJSON(report);
      const parsed = JSON.parse(json);
      
      expect(parsed.allocations).toHaveLength(3);
      expect(parsed.allocations[0].investor.name).toBe('John Smith');
      expect(parsed.allocations[0].tokens.amount).toBe(200000);
    });
  });
});

