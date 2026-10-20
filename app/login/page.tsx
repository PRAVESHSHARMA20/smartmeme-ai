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
import { validateEmail } from "@/lib/validation";

type Status = "idle" | "submitting" | "error" | "success";

/**
 * No backend exists yet (prototype phase), so submission is simulated.
 * For demoing the error state during review: email "blocked@demo.com"
 * with any password will deliberately fail. Anything else succeeds.
 */
const DEMO_BLOCKED_EMAIL = "blocked@demo.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const emailRef = React.useRef<HTMLInputElement>(null);

  function handleBlur(field: "email" | "password") {
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: password ? undefined : "Password is required." }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = password ? undefined : "Password is required.";
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      emailRef.current?.focus();
      return;
    }

    setStatus("submitting");

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (email.toLowerCase() === DEMO_BLOCKED_EMAIL) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/feed"), 700);
  }

  const submitting = status === "submitting" || status === "success";

  return (
    <AuthLayout>
      <h1 className="sr-only">Log in to SmartMeme AI</h1>
      <Card elevation={1} className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Log in to see what your feed's been up to.</CardDescription>
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
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              error={errors.password}
              disabled={submitting}
            />

            {status === "error" && (
              <FormMessage variant="error">
                We couldn&apos;t find an account with that email and password.
              </FormMessage>
            )}
            {status === "success" && (
              <FormMessage variant="success">Welcome back — taking you to your feed…</FormMessage>
            )}

            <Button type="submit" size="lg" disabled={submitting} className="mt-1">
              {status === "submitting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Logging in…
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
