"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const supabase = getSupabase();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setStatus("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Forgot password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your email and we'll send password reset instructions.</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset email'}
          </button>
        </form>
        {status && <p className="text-sm mt-4">{status}</p>}
      </div>
    </div>
  );
}
