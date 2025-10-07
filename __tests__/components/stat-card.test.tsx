import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/stat-card';
import { DollarSign } from 'lucide-react';

describe('StatCard', () => {
  it('renders with all props', () => {
    render(
      <StatCard
        title="Total Raised"
        value="$1,500,000"
        subtitle="+12% from last month"
        icon={DollarSign}
      />
    );

    expect(screen.getByText('Total Raised')).toBeInTheDocument();
    expect(screen.getByText('$1,500,000')).toBeInTheDocument();
    expect(screen.getByText('+12% from last month')).toBeInTheDocument();
  });

  it('renders without subtitle', () => {
    render(
      <StatCard
        title="Active Rounds"
        value={5}
        icon={DollarSign}
      />
    );

    expect(screen.getByText('Active Rounds')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders numeric values correctly', () => {
    render(
      <StatCard
        title="Investors"
        value={42}
        icon={DollarSign}
      />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(
      <StatCard
        title="Status"
        value="Active"
        icon={DollarSign}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="100"
        icon={DollarSign}
        className="custom-stat-card"
      />
    );

    const card = container.querySelector('.custom-stat-card');
    expect(card).toBeInTheDocument();
  });

  it('renders the icon', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="100"
        icon={DollarSign}
      />
    );

    // Check for SVG element which is rendered by lucide-react icons
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});

