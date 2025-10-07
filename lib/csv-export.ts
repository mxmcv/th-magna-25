// CSV export utilities for dashboard data
// Provides functionality to export dashboard data in CSV format

import { formatCurrency, formatDate, calculatePercentage } from './formatters';

/**
 * Escapes special characters in CSV fields
 * Handles quotes and commas properly
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringValue = String(field);
  
  // If field contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of objects to CSV string
 */
function convertToCSV(data: any[][], headers: string[]): string {
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push(headers.map(escapeCSVField).join(','));
  
  // Add data rows
  data.forEach(row => {
    csvRows.push(row.map(escapeCSVField).join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Triggers a CSV file download in the browser
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export interface DashboardExportData {
  rounds: any[];
  recentActivity: any[];
  stats: {
    totalRaised: number;
    activeRoundsCount: number;
    totalInvestors: number;
    totalRoundsCount: number;
    completedRoundsCount: number;
  };
}

/**
 * Exports company dashboard data to CSV format
 * Includes summary stats, active rounds, and recent activity
 */
export function exportDashboardToCSV(data: DashboardExportData): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `dashboard-export-${timestamp}.csv`;
  
  // Build CSV content with multiple sections
  let csvContent = '';
  
  // Section 1: Summary Statistics
  csvContent += 'DASHBOARD SUMMARY\n';
  csvContent += convertToCSV(
    [
      ['Total Raised', formatCurrency(data.stats.totalRaised)],
      ['Total Rounds', data.stats.totalRoundsCount.toString()],
      ['Active Rounds', data.stats.activeRoundsCount.toString()],
      ['Completed Rounds', data.stats.completedRoundsCount.toString()],
      ['Total Investors', data.stats.totalInvestors.toString()],
    ],
    ['Metric', 'Value']
  );
  
  csvContent += '\n\n';
  
  // Section 2: Active Rounds Details
  csvContent += 'ACTIVE ROUNDS\n';
  const activeRounds = data.rounds.filter((r: any) => r.status === 'ACTIVE');
  
  if (activeRounds.length > 0) {
    const roundsData = activeRounds.map((round: any) => [
      round.name,
      round.status,
      formatCurrency(round.raised),
      formatCurrency(round.target),
      `${calculatePercentage(round.raised, round.target)}%`,
      round.participants?.toString() || '0',
      formatDate(round.startDate),
      formatDate(round.endDate),
      formatCurrency(round.minContribution),
      formatCurrency(round.maxContribution),
      round.acceptedTokens?.join('; ') || '',
    ]);
    
    csvContent += convertToCSV(
      roundsData,
      [
        'Round Name',
        'Status',
        'Raised',
        'Target',
        'Progress',
        'Participants',
        'Start Date',
        'End Date',
        'Min Contribution',
        'Max Contribution',
        'Accepted Tokens',
      ]
    );
  } else {
    csvContent += 'No active rounds\n';
  }
  
  csvContent += '\n\n';
  
  // Section 3: All Rounds Summary
  csvContent += 'ALL ROUNDS SUMMARY\n';
  
  if (data.rounds.length > 0) {
    const allRoundsData = data.rounds.map((round: any) => [
      round.name,
      round.status,
      formatCurrency(round.raised),
      formatCurrency(round.target),
      `${calculatePercentage(round.raised, round.target)}%`,
      round.participants?.toString() || '0',
      formatDate(round.startDate),
      formatDate(round.endDate),
    ]);
    
    csvContent += convertToCSV(
      allRoundsData,
      [
        'Round Name',
        'Status',
        'Raised',
        'Target',
        'Progress',
        'Participants',
        'Start Date',
        'End Date',
      ]
    );
  } else {
    csvContent += 'No rounds\n';
  }
  
  csvContent += '\n\n';
  
  // Section 4: Recent Activity
  csvContent += 'RECENT ACTIVITY\n';
  
  if (data.recentActivity.length > 0) {
    const activityData = data.recentActivity.map((activity: any) => [
      activity.investor,
      activity.round,
      formatCurrency(activity.amount),
      activity.time,
    ]);
    
    csvContent += convertToCSV(
      activityData,
      ['Investor', 'Round', 'Amount', 'Time']
    );
  } else {
    csvContent += 'No recent activity\n';
  }
  
  // Trigger download
  downloadCSV(csvContent, filename);
}

/**
 * Prepares dashboard data for CSV export
 * Can be used to validate data before export
 */
export function prepareDashboardExportData(
  rounds: any[],
  recentActivity: any[]
): DashboardExportData {
  const activeRounds = rounds.filter((r: any) => r.status === 'ACTIVE');
  const completedRounds = rounds.filter(
    (r: any) => r.status === 'COMPLETED' || r.status === 'CLOSED'
  );
  const totalRaised = rounds.reduce((sum: number, r: any) => sum + r.raised, 0);
  const totalInvestors = new Set(
    recentActivity.map((a: any) => a.investor)
  ).size;
  
  return {
    rounds,
    recentActivity,
    stats: {
      totalRaised,
      activeRoundsCount: activeRounds.length,
      totalInvestors,
      totalRoundsCount: rounds.length,
      completedRoundsCount: completedRounds.length,
    },
  };
}

