"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Logo } from "@/components/Logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 3000;

export default function PaymentSuccess() {
  const { user, isLoading: authLoading } = useAuth();
  const { refresh: refreshSubscription } = useSubscription();
  const router = useRouter();

  const [verifying, setVerifying] = useState(true);
  const [subscriptionFound, setSubscriptionFound] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  // Use refs so the retry closure always sees current values
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!mountedRef.current) return;

      if (res.ok) {
        const data = await res.json();
        if (data.subscribed) {
          setSubscriptionFound(true);
          setVerifying(false);
          // Sync the global subscription context so pro-dashboard works immediately
          await refreshSubscription();
          return;
        }
      }

      // Not found yet — retry if under limit
      attemptRef.current += 1;
      if (attemptRef.current < MAX_ATTEMPTS) {
        timerRef.current = setTimeout(checkSubscription, RETRY_DELAY_MS);
      } else {
        setVerifying(false);
        setShowDialog(true);
      }
    } catch (err) {
      console.error("Subscription check error:", err);
      if (mountedRef.current) setVerifying(false);
    }
  }, [refreshSubscription]);

  // Kick off verification once auth has settled
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    checkSubscription();
  }, [user, authLoading, checkSubscription, router]);

  const manualRefresh = async () => {
    setManualRefreshing(true);
    attemptRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    await checkSubscription();
    setManualRefreshing(false);
  };

  // Loading state while auth or initial check is running
  if (authLoading || (verifying && !subscriptionFound)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-foreground font-medium">Confirming your subscription…</p>
        <p className="text-sm text-muted-foreground">
          Attempt {attemptRef.current + 1} of {MAX_ATTEMPTS}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex justify-center mb-6">
          <Logo variant="compact" />
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className={`h-12 w-12 ${subscriptionFound ? "text-green-500" : "text-amber-400"}`} />
            </div>
            <CardTitle className="text-2xl">
              {subscriptionFound ? "You're all set!" : "Payment received"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {subscriptionFound ? (
              <p className="text-muted-foreground">
                Thank you for subscribing to Raxti Pro. Your account is active.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Your payment went through. Subscription activation can take a
                  moment — hit refresh below if it hasn&apos;t appeared yet.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 text-left">
                  <p className="font-medium text-amber-600 dark:text-amber-400 text-sm">
                    If your subscription still doesn&apos;t appear after a
                    minute, contact support from your profile page.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={manualRefresh}
                  disabled={manualRefreshing}
                  className="w-full"
                >
                  {manualRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Subscription Status
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {subscriptionFound && (
                <Button asChild className="w-full">
                  <Link href="/pro-dashboard">Go to Pro Dashboard</Link>
                </Button>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href="/profile">Manage Your Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Pending</AlertDialogTitle>
            <AlertDialogDescription>
              Your payment was successful, but subscription activation is taking
              longer than expected. Please check your profile in a few minutes.
              If the issue persists, contact support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => router.push("/profile")}>
                Go to Profile
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
