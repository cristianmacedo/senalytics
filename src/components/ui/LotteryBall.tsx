interface LotteryBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "highlight" | "muted" | "selected";
  animate?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-2xl",
};

const variantClasses = {
  default:
    "bg-gradient-to-br from-mega-green to-mega-green-dark text-white shadow-lg",
  highlight:
    "bg-gradient-to-br from-ball-gold to-amber-500 text-slate-900 shadow-lg shadow-amber-200",
  muted: "bg-slate-200 text-slate-500",
  selected:
    "bg-gradient-to-br from-caixa-blue to-caixa-blue-dark text-white shadow-lg ring-2 ring-caixa-blue-light",
};

export function LotteryBall({
  number,
  size = "md",
  variant = "default",
  animate = false,
  onClick,
}: LotteryBallProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full font-bold
        flex items-center justify-center
        transition-all duration-200
        ${
          onClick
            ? "cursor-pointer hover:scale-110 active:scale-95"
            : "cursor-default"
        }
        ${animate ? "ball-animate" : ""}
      `}
    >
      {number.toString().padStart(2, "0")}
    </button>
  );
}

interface LotteryBallGridProps {
  numbers: number[];
  selectedNumbers?: number[];
  onNumberClick?: (number: number) => void;
  size?: "sm" | "md" | "lg";
}

export function LotteryBallGrid({
  numbers,
  selectedNumbers = [],
  onNumberClick,
  size = "sm",
}: LotteryBallGridProps) {
  const selectedSet = new Set(selectedNumbers);

  return (
    <div className="grid grid-cols-10 gap-2">
      {numbers.map((num) => (
        <LotteryBall
          key={num}
          number={num}
          size={size}
          variant={selectedSet.has(num) ? "selected" : "muted"}
          onClick={onNumberClick ? () => onNumberClick(num) : undefined}
        />
      ))}
    </div>
  );
}

interface DrawResultProps {
  numbers: number[];
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function DrawResult({
  numbers,
  size = "md",
  animate = false,
}: DrawResultProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {numbers.map((num) => (
        <LotteryBall
          key={num}
          number={num}
          size={size}
          variant="default"
          animate={animate}
          // Stagger animation
          // style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
}
