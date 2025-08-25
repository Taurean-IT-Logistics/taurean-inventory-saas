"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "overlay" | "inline";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function Loader({
  size = "md",
  variant = "default",
  text,
  className,
}: LoaderProps) {
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
          {text && (
            <p
              className={cn(
                "text-muted-foreground font-medium",
                textSizeClasses[size]
              )}
            >
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        {text && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p
          className={cn(
            "text-muted-foreground font-medium text-center",
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <Loader variant="default" size="lg" text={text} className="min-h-[400px]" />
  );
}

export function OverlayLoader({ text = "Loading..." }: { text?: string }) {
  return <Loader variant="overlay" size="lg" text={text} />;
}

export function InlineLoader({
  text,
  size = "sm",
}: {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return <Loader variant="inline" size={size} text={text} />;
}

export function ButtonLoader({
  size = "sm",
}: {
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return <Loader2 className={cn("animate-spin", sizeClasses[size])} />;
}
