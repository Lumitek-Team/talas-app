import * as React from "react"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "cursor-pointer bg-green-500 text-white rounded-lg px-8 py-3 text-1xl font-normal transition-colors duration-200 hover:bg-green-400 focus:bg-green-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
