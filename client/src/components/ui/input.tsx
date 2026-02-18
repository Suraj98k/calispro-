import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
}

function Input({ className, type, prefixIcon, ...props }: InputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      {prefixIcon && (
        <div className="absolute left-2 flex items-center pointer-events-none">
          {prefixIcon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          prefixIcon ? "pl-8" : "pl-3", // Adjust padding if icon is present
          // Remove default padding from input if it's applied via className
          // and ensure className applies to the outer div or merges correctly
          className // This className should primarily affect the outer div now
        )}
        {...props}
      />
    </div>
  )
}

export { Input }
