import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const messageId = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={messageId}
          className={cn(
            "w-full resize-none rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            error && "border-blocked focus-visible:ring-blocked",
            className
          )}
          {...props}
        />
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
Textarea.displayName = "Textarea";

export { Textarea };
