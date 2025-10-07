// status badge - shows round/contribution/investor status with consistent styling
// maps status strings to color tokens so we don't hardcode colors everywhere
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

