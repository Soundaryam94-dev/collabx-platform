"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#A1A1AA]">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full glass rounded-xl px-4 py-3 text-white placeholder-[#A1A1AA]
              border border-white/10 focus:border-[#7C5CFF] focus:outline-none
              transition-colors duration-200 bg-transparent
              ${icon ? "pl-10" : ""}
              ${error ? "border-red-500/60" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
