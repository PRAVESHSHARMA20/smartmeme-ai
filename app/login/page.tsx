"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(
          data.session
            ? "Account created successfully! You are logged in."
            : "Account created! Check your email to confirm your account."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/feed";
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-3xl rounded-full bg-accent/15 opacity-50 blur-[120px]" />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md space-y-6 rounded-2xl border border-border bg-surface-1/95 p-7 shadow-2xl shadow-black/20 sm:p-9"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <ShieldCheck size={25} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SmartMeme AI</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Welcome back. Your feed is waiting."
              : "Create your SmartMeme AI account."}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">Email address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent p-3.5 font-semibold text-accent-foreground shadow-lg shadow-accent/15 transition hover:bg-accent/90 hover:shadow-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        {message && (
          <p role="status" className="break-words rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-foreground">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
            }}
            className="font-semibold text-accent transition-colors hover:text-accent/80"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </main>
  );
}
