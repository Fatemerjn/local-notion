import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

          variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-800",
          variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          variant === "outline" &&
            "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700",

          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 px-3 text-xs",
          size === "icon" && "h-9 w-9",

          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
