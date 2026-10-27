
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState("Not tested");

  async function testConnection() {
    setStatus("Connecting...");

    try {
      const { error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error) {
        setStatus("Connection error: " + error.message);
        return;
      }

      setStatus("Connected successfully to Supabase!");
    } catch (err) {
      setStatus(
        "Error: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-bold">
        SmartMeme AI — Database Test
      </h1>

      <button
        onClick={testConnection}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white"
      >
        Test Supabase Connection
      </button>

      <p className="mt-5 break-words" role="status">
        {status}
      </p>
    </main>
  );
}
