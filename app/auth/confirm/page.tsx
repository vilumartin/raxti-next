"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Suspense } from "react";

function ConfirmHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleConfirm = async () => {
      // PKCE flow: ?code=xxx
      const code = searchParams.get("code");
      // OTP / magic-link flow: ?token_hash=xxx&type=xxx
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as any;
      // Where to redirect after success
      const next = searchParams.get("next") || "/";

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else {
          // Implicit / hash flow — session already set by supabase-js; just redirect
        }

        setStatus("success");
        setMessage("Email confirmed! Redirecting...");
        setTimeout(() => router.push(next), 1000);
      } catch (err: any) {
        console.error("Auth confirm error:", err);
        setStatus("error");
        setMessage(err?.message || "Confirmation failed. The link may have expired.");
        setTimeout(() => router.push("/auth"), 3000);
      }
    };

    handleConfirm();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        {status === "loading" && (
          <>
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Confirming your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 font-medium">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-10 w-10 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-destructive">{message}</p>
            <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmHandler />
    </Suspense>
  );
}
