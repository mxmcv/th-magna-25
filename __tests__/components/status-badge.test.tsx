import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/dashboard/status-badge';

describe('StatusBadge', () => {
  it('renders with the correct status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('capitalizes the status text', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('handles uppercase status', () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('applies correct styling for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.querySelector('[class*="primary"]');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct styling for completed status', () => {
    const { container } = render(<StatusBadge status="completed" />);
    const badge = container.querySelector('[class*="green"]');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct styling for pending status', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.querySelector('[class*="yellow"]');
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<StatusBadge status="active" className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('handles unknown status with default styling', () => {
    const { container } = render(<StatusBadge status="unknown-status" />);
    const badge = container.querySelector('[class*="muted"]');
    expect(badge).toBeInTheDocument();
  });
});

