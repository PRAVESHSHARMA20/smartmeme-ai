import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Rendered below the field in the blocked/error color; also wired to aria-describedby + aria-invalid. */
  error?: string;
  /** Neutral helper text, hidden automatically when `error` is present. */
  hint?: string;
  /**
   * Optional content pinned to the right edge of the field (e.g. a
   * show/hide-password toggle). Kept generic rather than a one-off
   * "password variant" so any future field (search, currency, etc.)
   * can reuse the same slot.
   */
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, endAdornment, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={messageId}
            className={cn(
              "h-10 w-full rounded-md border border-border bg-surface-1 px-3 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
              error && "border-blocked focus-visible:ring-blocked",
              endAdornment && "pr-10",
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">{endAdornment}</div>
          )}
        </div>
        {error ? (
          <p id={messageId} className="text-xs text-blocked">
            {error}
          </p>
        ) : hint ? (
          <p id={messageId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
