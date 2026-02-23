"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabase();

        // Exchange the URL for a session (handles OAuth and password recovery)
        // `getSessionFromUrl` will parse the access token in the URL and store the session.
        // Cast `auth` to `any` to avoid mismatched TS types across supabase versions.
        const authAny = supabase.auth as any;
        if (typeof authAny.getSessionFromUrl === "function") {
          // Ensure session is saved to local storage
          const { data, error } = await authAny.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
          console.log('Auth callback: session stored', data?.session);
          // Redirect to a sensible post-login page
          router.replace('/dashboard/admin');
          return;
        }

        // Fallback: try to read session and continue
        const { data: { session }, error: getErr } = await supabase.auth.getSession();
        if (getErr) throw getErr;
        if (session) {
          router.replace("/");
        } else {
          // Nothing to do, go to home
          router.replace("/");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err?.message || "Authentication callback failed");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Finishing sign in...</h2>
        {error ? (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        ) : (
          <p className="text-sm text-gray-500 mt-2">You will be redirected shortly.</p>
        )}
      </div>
    </div>
  );
}
