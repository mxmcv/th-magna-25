// token allocation - the extra feature that connects to magna's core business
// takes fundraising contributions and calculates pro-rata token distribution
// exports match the format magna's vesting platform expects for import

export interface TokenAllocation {
  investorId: string;
  investorName: string;
  investorEmail: string;
  walletAddress?: string;
  contributionAmount: number;
  tokenAmount: number;
  percentage: number;
  vestingSchedule?: {
    cliff: number;
    duration: number;
    tge: number; // token generation event unlock percentage
  };
}

export interface AllocationReport {
  roundId: string;
  roundName: string;
  totalRaised: number;
  totalTokens: number;
  tokenPrice: number;
  allocations: TokenAllocation[];
  generatedAt: Date;
}

// core allocation math: each investor gets tokens proportional to their contribution
// keeping this pure (no side effects) makes it easy to test and reason about
export function calculateTokenAllocations(
  contributions: Array<{
    investorId: string;
    investorName: string;
    investorEmail: string;
    walletAddress?: string;
    amount: number;
  }>,
  tokenPrice: number,
  vestingConfig?: {
    cliff: number;
    duration: number;
    tge: number;
  }
): TokenAllocation[] {
  const totalRaised = contributions.reduce((sum, c) => sum + c.amount, 0);
  
  return contributions.map((contribution) => {
    const tokenAmount = contribution.amount / tokenPrice;
    const percentage = (contribution.amount / totalRaised) * 100;

    return {
      investorId: contribution.investorId,
      investorName: contribution.investorName,
      investorEmail: contribution.investorEmail,
      walletAddress: contribution.walletAddress,
      contributionAmount: contribution.amount,
      tokenAmount,
      percentage,
      vestingSchedule: vestingConfig,
    };
  });
}

// CSV export for magna's vesting system
// includes all the fields they'd need: investor details, amounts, vesting schedule
export function exportToMagnaCSV(report: AllocationReport): string {
  const headers = [
    'Investor Name',
    'Email',
    'Wallet Address',
    'Contribution (USD)',
    'Token Amount',
    'Percentage',
    'Cliff (months)',
    'Vesting Duration (months)',
    'TGE Unlock %',
    'Notes',
  ];

  const rows = report.allocations.map((alloc) => [
    alloc.investorName,
    alloc.investorEmail,
    alloc.walletAddress || '',
    alloc.contributionAmount.toFixed(2),
    alloc.tokenAmount.toFixed(6),
    alloc.percentage.toFixed(4),
    alloc.vestingSchedule?.cliff || 0,
    alloc.vestingSchedule?.duration || 0,
    alloc.vestingSchedule?.tge || 0,
    `${report.roundName} - Generated ${new Date(report.generatedAt).toLocaleDateString()}`,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

// json export for api integration with magna's platform
// structured for easy parsing and validation
export function exportToJSON(report: AllocationReport): string {
  return JSON.stringify(
    {
      metadata: {
        roundId: report.roundId,
        roundName: report.roundName,
        totalRaised: report.totalRaised,
        totalTokens: report.totalTokens,
        tokenPrice: report.tokenPrice,
        generatedAt: report.generatedAt,
        exportVersion: '1.0',
        platform: 'Magna Fundraising Platform',
      },
      allocations: report.allocations.map((alloc) => ({
        investor: {
          id: alloc.investorId,
          name: alloc.investorName,
          email: alloc.investorEmail,
          walletAddress: alloc.walletAddress || null,
        },
        contribution: {
          amount: alloc.contributionAmount,
          currency: 'USD',
        },
        tokens: {
          amount: alloc.tokenAmount,
          percentage: alloc.percentage,
        },
        vesting: alloc.vestingSchedule || null,
      })),
    },
    null,
    2
  );
}
