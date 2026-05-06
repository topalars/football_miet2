'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  hint?: string;
  error?: string | null;
};

export const Field = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(
  function Field({ label, hint, error, className = '', ...rest }, ref) {
    return (
      <label className="block">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/55">{label}</span>
          {hint && <span className="text-[11px] text-white/30">{hint}</span>}
        </div>
        <input
          ref={ref}
          className={`w-full bg-transparent border-b border-white/15 focus:border-accent outline-none py-3 text-[15px] placeholder:text-white/25 transition-colors ${className}`}
          {...rest}
        />
        {error && <span className="block mt-2 text-[12px] text-red-400/90">{error}</span>}
      </label>
    );
  },
);

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ label, hint, error, className = '', ...rest }, ref) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] tracking-[0.3em] uppercase text-white/55">{label}</span>
        {hint && <span className="text-[11px] text-white/30">{hint}</span>}
      </div>
      <textarea
        ref={ref}
        className={`w-full bg-transparent border border-white/10 rounded-xl focus:border-accent outline-none p-4 text-[15px] placeholder:text-white/25 transition-colors resize-none ${className}`}
        rows={5}
        {...rest}
      />
      {error && <span className="block mt-2 text-[12px] text-red-400/90">{error}</span>}
    </label>
  );
});
