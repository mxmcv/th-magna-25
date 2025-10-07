/**
 * Status Badge Helper Component
 * Provides consistent status badge rendering across the application
 */

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import type { RoundStatus, InvestorStatus, ContributionStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: RoundStatus | InvestorStatus | ContributionStatus | string;
  variant?: "default" | "compact";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || "unknown";
  const showIcon = variant === "default";

  switch (normalizedStatus) {
    case "active":
      return (
        <Badge className="bg-primary/10 text-primary gap-1">
          {showIcon && <CheckCircle className="w-3 h-3" />}
          Active
        </Badge>
      );

    case "completed":
    case "confirmed":
      return (
        <Badge className="bg-green-500/10 text-green-500 gap-1">
          {showIcon && <CheckCircle className="w-3 h-3" />}
          {normalizedStatus === "confirmed" ? "Confirmed" : "Completed"}
        </Badge>
      );

    case "pending":
    case "invited":
      return (
        <Badge variant="outline" className="gap-1">
          {showIcon && <Clock className="w-3 h-3" />}
          {normalizedStatus === "invited" ? "Invited" : "Pending"}
        </Badge>
      );

    case "closed":
      return (
        <Badge variant="secondary" className="gap-1">
          {showIcon && <XCircle className="w-3 h-3" />}
          Closed
        </Badge>
      );

    case "draft":
      return (
        <Badge variant="outline" className="gap-1">
          {showIcon && <AlertCircle className="w-3 h-3" />}
          Draft
        </Badge>
      );

    case "inactive":
    case "failed":
      return (
        <Badge variant="secondary" className="gap-1 text-muted-foreground">
          {showIcon && <XCircle className="w-3 h-3" />}
          {normalizedStatus === "failed" ? "Failed" : "Inactive"}
        </Badge>
      );

    default:
      return (
        <Badge variant="secondary">
          {status || "Unknown"}
        </Badge>
      );
  }
}
