import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({
  className = "",
  size = 24,
}: LoadingSpinnerProps) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
}

export function LoadingCard() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner size={32} />
      <p className="text-muted-foreground">Loading availability...</p>
    </div>
  );
}
