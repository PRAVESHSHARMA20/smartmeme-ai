"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Input
      ref={ref}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
