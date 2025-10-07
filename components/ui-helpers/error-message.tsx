/**
 * Error Message Component
 * Provides consistent error message display across the application
 */

import { AlertCircle, X } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-destructive hover:text-destructive/80 transition-colors flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
