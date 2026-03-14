'use client';
import React from "react";
import { cn } from "../../lib/utils";

const BUTTON_VARIANTS = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
  link: "bg-transparent text-emerald-700 underline-offset-4 hover:underline",
};

const BUTTON_SIZES = {
  default: "h-11 px-4 py-2",
  sm: "h-9 rounded-lg px-3 text-xs",
  lg: "h-12 rounded-xl px-8",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium",
        "transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500/60",
        "disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    />
  );
});

export { Button };
