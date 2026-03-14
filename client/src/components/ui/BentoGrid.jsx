import React from "react";
import { cn } from "../../lib/utils";

function BentoGrid({ children, className }) {
  return (
    <div className={cn("grid w-full auto-rows-[18rem] grid-cols-3 gap-4", className)}>
      {children}
    </div>
  );
}

function BentoCard({
  name,
  className,
  background,
  icon,
  description,
}) {
  return (
    <div
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-3xl",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        className
      )}
    >
      <div>{background}</div>

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300 group-hover:-translate-y-2">
        {React.createElement(icon, {
          className:
            "h-11 w-11 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-90",
        })}
        <h3 className="text-xl font-semibold text-neutral-800">
          {name}
        </h3>
        <p className="max-w-lg text-sm leading-7 text-neutral-500">{description}</p>
      </div>

      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.02]" />
    </div>
  );
}

export { BentoCard, BentoGrid };
