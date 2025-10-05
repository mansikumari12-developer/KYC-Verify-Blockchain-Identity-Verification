import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.6)] hover:-translate-y-0.5 focus:shadow-[0_0_30px_hsl(var(--glow-primary)/0.6)] focus:-translate-y-0.5",
        destructive: "bg-error text-error-foreground hover:shadow-[0_0_25px_hsl(var(--glow-error)/0.5)] hover:-translate-y-0.5 focus:shadow-[0_0_25px_hsl(var(--glow-error)/0.5)]",
        outline: "border border-border bg-transparent text-foreground hover:bg-card-hover hover:shadow-[0_0_20px_hsl(var(--border)/0.4)] hover:-translate-y-0.5 focus:shadow-[0_0_20px_hsl(var(--border)/0.4)]",
        secondary: "bg-secondary border border-secondary-border text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_20px_hsl(var(--border)/0.4)] hover:-translate-y-0.5 focus:shadow-[0_0_20px_hsl(var(--border)/0.4)]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_15px_hsl(var(--accent)/0.3)] hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-[0_0_10px_hsl(var(--glow-primary)/0.3)]",
        gradient: "bg-gradient-primary text-white hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.6),_0_0_60px_hsl(var(--glow-primary)/0.4)] hover:-translate-y-1 focus:shadow-[0_0_30px_hsl(var(--glow-primary)/0.6)] hover:brightness-110",
        success: "bg-success text-success-foreground hover:shadow-[0_0_25px_hsl(var(--glow-success)/0.5),_0_0_40px_hsl(var(--glow-success)/0.3)] hover:-translate-y-1 focus:shadow-[0_0_25px_hsl(var(--glow-success)/0.5)] hover:brightness-110",
        social: "bg-card border border-border text-foreground hover:bg-card-hover hover:shadow-[0_0_20px_hsl(var(--border)/0.4)] hover:-translate-y-0.5 hover:border-border-light focus:shadow-[0_0_20px_hsl(var(--border)/0.4)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
