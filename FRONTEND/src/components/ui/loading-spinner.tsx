import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("animate-spin-slow", sizeClasses[size], className)}>
      <div className="h-full w-full rounded-full border-2 border-transparent border-t-current border-r-current"></div>
    </div>
  );
};

export default LoadingSpinner;