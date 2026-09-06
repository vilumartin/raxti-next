"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
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

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [subscriptionFound, setSubscriptionFound] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const checkSubscription = async () => {
    try {
      if (!user) return;

      setVerifying(true);
      console.log(`Verifying subscription: Attempt ${checkAttempts + 1}`);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking subscription:", error);
        toast.error("Error checking subscription status");
        return;
      }

      // If subscription is found, proceed
      if (data) {
        console.log("Subscription found:", data);
        setSubscriptionFound(true);
        setVerifying(false);
      } else {
        // If we've tried less than 5 times and no subscription is found, try again after a delay
        if (checkAttempts < 5) {
          console.log("No subscription found, will retry...");
          setCheckAttempts((prev) => prev + 1);
          setTimeout(() => checkSubscription(), 3000); // Try again in 3 seconds
        } else {
          console.log("No subscription found after multiple attempts");
          setVerifying(false);
          setShowDialog(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setVerifying(false);
    } finally {
      setLoading(false);
    }
  };

  const manualRefresh = async () => {
    try {
      setManualRefreshing(true);
      setCheckAttempts(0); // Reset attempts
      await checkSubscription();
    } finally {
      setManualRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push("/auth");
      return;
    }

    // Verify subscription status
    checkSubscription();
  }, [user]);

  if (loading && verifying && checkAttempts <= 5) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-steno-blue animate-spin mb-4" />
        <p>Verifying your subscription...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        <p className="text-xs text-gray-400 mt-1">
          Attempt {checkAttempts + 1}/6
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="raxti.app logo"
            className="h-16 mx-auto mb-6"
          />
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {subscriptionFound ? (
              <p className="text-gray-600">
                Thank you for subscribing to Raxti Pro. Your account has been
                successfully upgraded.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Your payment was successful! However, your subscription may
                  take a few moments to activate.
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-left">
                  <p className="font-medium text-amber-700 text-sm">
                    Please note: Your subscription details will be updated
                    shortly. If your subscription doesn&apos;t appear, please
                    try refreshing below.
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
                      Refreshing...
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
                <Button
                  asChild
                  className="w-full bg-steno-blue hover:bg-steno-darkBlue"
                >
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

      {/* Help Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Status Pending</AlertDialogTitle>
            <AlertDialogDescription>
              Your payment was successful, but we&apos;re having trouble
              detecting your active subscription. This can happen due to delays
              in processing. Please check your profile page in a few minutes.
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
