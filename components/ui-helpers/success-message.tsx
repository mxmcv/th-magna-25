/**
 * Success Message Component
 * Provides consistent success message display across the application
 */

import { CheckCircle, X } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border bg-card flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
