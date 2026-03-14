'use client';
import React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(function Input({ className, type, ...props }, ref) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
        "shadow-sm shadow-black/5 transition-shadow placeholder:text-slate-400",
        "focus-visible:border-emerald-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export { Input };
