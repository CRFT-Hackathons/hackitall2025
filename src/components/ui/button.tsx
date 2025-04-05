import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center relative justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:shadow-active disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 after:absolute after:inset-0 after:content-[''] after:bg-gradient-to-b after:bg-gradient after:to-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-border-primary hover:bg-primary-hover after:from-surface-a2",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-border-secondary hover:bg-secondary-hover after:from-surface-a2",
        accent:
          "bg-accent text-accentt-contrast shadow-border-accent hover:bg-accent-hover hover:text-accentt-contrast after:from-surface-a4",
        ghost: "hover:bg-surface-a3 hover:text-popover-foreground-active",
        link: "text-primary-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "rounded-sm px-3 py-1.5",
        sm: "py-1 rounded-md px-2 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "rounded-sm h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
