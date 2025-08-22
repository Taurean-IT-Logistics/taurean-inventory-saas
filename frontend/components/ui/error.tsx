"use client";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "card";
}

export function ErrorComponent({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = false,
  className = "",
  variant = "default",
}: ErrorComponentProps) {
  const baseClasses =
    "w-full flex flex-col items-center justify-center text-center h-full";

  const variantClasses = {
    default: "py-12 px-6 min-h-[400px]",
    minimal: "py-8 px-4",
    card: "bg-white rounded-lg border border-gray-200 shadow-sm p-8 mx-auto",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4 max-w-md w-full">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        {/* Error Content */}
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        {(showRetry || showGoHome) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            {showGoHome && onGoHome && (
              <Button
                onClick={onGoHome}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function PageError({
  onRetry,
  onGoHome,
}: {
  onRetry?: () => void;
  onGoHome?: () => void;
}) {
  return (
    <ErrorComponent
      variant="default"
      onRetry={onRetry}
      onGoHome={onGoHome}
      showGoHome={true}
      className="min-h-screen flex items-center justify-center"
    />
  );
}

export function CardError({
  onRetry,
  message,
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <ErrorComponent
      variant="card"
      message={message}
      onRetry={onRetry}
      showGoHome={false}
      className="max-w-md"
    />
  );
}

export function InlineError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorComponent
      variant="minimal"
      title="Error"
      message={message}
      onRetry={onRetry}
      showGoHome={false}
      className="py-4"
    />
  );
}
