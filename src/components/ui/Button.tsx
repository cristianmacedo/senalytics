import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-mega-green to-mega-green-dark text-white hover:from-mega-green-dark hover:to-mega-green shadow-lg shadow-mega-green/25',
  secondary: 'bg-gradient-to-r from-caixa-blue to-caixa-blue-dark text-white hover:from-caixa-blue-dark hover:to-caixa-blue shadow-lg shadow-caixa-blue/25',
  outline: 'border-2 border-mega-green text-mega-green hover:bg-mega-green hover:text-white',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-xl font-semibold
        transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
