"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatNumber, calculatePercentageChange } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  previousValue,
  icon: Icon,
  description,
  trend,
  trendValue,
  loading = false,
  className,
  onClick,
}: MetricCardProps) {
  // Calculate trend if previousValue is provided and trendValue is not
  const calculatedTrend = React.useMemo(() => {
    if (trendValue !== undefined) return trendValue;
    if (previousValue !== undefined && typeof value === "number") {
      return calculatePercentageChange(value, previousValue);
    }
    return 0;
  }, [value, previousValue, trendValue]);

  const calculatedTrendDirection = React.useMemo(() => {
    if (trend) return trend;
    if (calculatedTrend > 0) return "up";
    if (calculatedTrend < 0) return "down";
    return "neutral";
  }, [trend, calculatedTrend]);

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[calculatedTrendDirection];

  const trendColorClass = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-foreground-muted",
  }[calculatedTrendDirection];

  if (loading) {
    return (
      <div
        className={cn(
          "bg-background-secondary border border-border rounded-xl p-6 animate-pulse",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-4 h-4 bg-glass-light rounded"></div>
          <div className="w-6 h-6 bg-glass-light rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-glass-light rounded w-3/4"></div>
          <div className="h-4 bg-glass-light rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-background-secondary border border-border rounded-xl p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        onClick && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground-secondary">
          {title}
        </h3>
        <div className="p-2 bg-glass-light rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Value */}
      <div className="space-y-2">
        <div className="text-2xl font-bold text-foreground">
          {typeof value === "number" ? formatNumber(value) : value}
        </div>

        {/* Trend and Description */}
        <div className="flex items-center justify-between">
          {(calculatedTrend !== 0 || description) && (
            <div className="flex items-center space-x-2">
              {calculatedTrend !== 0 && (
                <>
                  <TrendIcon className={cn("w-4 h-4", trendColorClass)} />
                  <span className={cn("text-sm font-medium", trendColorClass)}>
                    {Math.abs(calculatedTrend).toFixed(1)}%
                  </span>
                </>
              )}
              {description && (
                <span className="text-sm text-foreground-muted">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtle bottom border for visual enhancement */}
      <div className="mt-4 h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 rounded-full opacity-50"></div>
    </div>
  );
}