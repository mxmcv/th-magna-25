// Reusable status badge component
import { Badge } from '@/components/ui/badge';
import { getStatusColor, capitalize } from '@/lib/formatters';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={`${getStatusColor(status)} ${className || ''}`}>
      {capitalize(status)}
    </Badge>
  );
}

