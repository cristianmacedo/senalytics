import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  onClick?: () => void;
}

const variantClasses = {
  default: "bg-white shadow-sm",
  elevated: "bg-white shadow-lg",
  outlined: "bg-white border border-slate-200",
};

export function Card({
  children,
  className = "",
  variant = "default",
  onClick,
}: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
}: StatCardProps) {
  const trendColors = {
    up: "text-mega-green",
    down: "text-red-500",
    neutral: "text-slate-500",
  };

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p
              className={`text-sm mt-1 ${
                trend ? trendColors[trend] : "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Section({
  title,
  subtitle,
  children,
  action,
  className = "",
}: SectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
