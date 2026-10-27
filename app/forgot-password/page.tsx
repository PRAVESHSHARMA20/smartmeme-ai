
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("If the account exists, a password-reset email will be sent. Check your inbox.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form onSubmit={handleReset} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <label htmlFor="email" className="block text-sm">Email address</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
          placeholder="you@example.com"
        />
        <button disabled={loading} className="w-full rounded-lg bg-blue-600 p-3 font-semibold disabled:opacity-50">
          {loading ? "Sending..." : "Send reset email"}
        </button>
        {message && <p role="status" className="break-words text-sm text-blue-300">{message}</p>}
        <a href="/login" className="block text-sm text-blue-400">Back to login</a>
      </form>
    </main>
  );
}
