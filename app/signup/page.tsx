"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { FormMessage } from "@/components/auth/form-message";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateEmail, validatePassword, validateConfirmPassword } from "@/lib/validation";

type Status = "idle" | "submitting" | "error" | "success";

/**
 * No backend exists yet (prototype phase), so submission is simulated.
 * For demoing the error state during review: email "taken@demo.com"
 * will deliberately report as already registered. Anything else succeeds.
 */
const DEMO_TAKEN_EMAIL = "taken@demo.com";

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const emailRef = React.useRef<HTMLInputElement>(null);

  function handleBlur(field: keyof FieldErrors) {
    setErrors((prev) => ({
      ...prev,
      email: field === "email" ? validateEmail(email) : prev.email,
      password: field === "password" ? validatePassword(password) : prev.password,
      confirmPassword:
        field === "confirmPassword" ? validateConfirmPassword(password, confirmPassword) : prev.confirmPassword,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password || nextErrors.confirmPassword) {
      emailRef.current?.focus();
      return;
    }

    setStatus("submitting");

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (email.toLowerCase() === DEMO_TAKEN_EMAIL) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/feed"), 700);
  }

  const submitting = status === "submitting" || status === "success";

  return (
    <AuthLayout>
      <h1 className="sr-only">Create your SmartMeme AI account</h1>
      <Card elevation={1} className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join the feed — memes, protected by default.</CardDescription>
        </CardHeader>

        <CardContent>
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              ref={emailRef}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              disabled={submitting}
            />

            <PasswordInput
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              error={errors.password}
              disabled={submitting}
            />

            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="h-11"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              error={errors.confirmPassword}
              disabled={submitting}
            />

            {status === "error" && (
              <FormMessage variant="error">
                An account with that email already exists. Try logging in instead.
              </FormMessage>
            )}
            {status === "success" && (
              <FormMessage variant="success">Account created — taking you to your feed…</FormMessage>
            )}

            <Button type="submit" size="lg" disabled={submitting} className="mt-1">
              {status === "submitting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
