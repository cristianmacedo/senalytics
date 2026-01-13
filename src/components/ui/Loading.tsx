interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export function Loading({ size = 'md', text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-mega-green animate-spin" />
      </div>
      {text && <p className="text-slate-500 font-medium">{text}</p>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading size="lg" text="Carregando..." />
    </div>
  );
}

export function LoadingInline() {
  return (
    <span className="inline-flex items-center gap-2">
      <Loading size="sm" />
    </span>
  );
}
