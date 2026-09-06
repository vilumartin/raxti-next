"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      checkSubscription();
    } else {
      router.push("/auth");
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      setLoading(true);

      // Add detailed logging
      console.log("Checking subscription for user:", user?.id);

      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user?.id ?? "")
          .maybeSingle();

      if (subscriptionError) {
        console.error("Error fetching subscription:", subscriptionError);
        setDebugInfo({ error: subscriptionError });
      } else {
        console.log("Subscription data retrieved:", subscriptionData);
        setDebugInfo({ subscription: subscriptionData });
      }

      setSubscriptionStatus(subscriptionData?.status || null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setDebugInfo({ error: error });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Make sure user is authenticated
      if (!user) {
        toast.error("Please log in to subscribe");
        router.push("/auth");
        return;
      }

      // Log the request details
      console.log("Creating checkout session for user:", user.id);

      const requestBody = discountCode
        ? { promotion_code: discountCode.trim() }
        : {};

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Function error:", data);
        setErrorDialog({
          open: true,
          message: "Failed to start subscription process. Please try again.",
        });
        return;
      }

      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from create-checkout function");
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      setErrorDialog({
        open: true,
        message:
          "Failed to start subscription process. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Close error dialog
  const closeErrorDialog = () => {
    setErrorDialog({ open: false, message: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-6">Subscribe to Raxti Pro</h1>

        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Unlock Raxti Pro Features</CardTitle>
            <CardDescription>
              Get access to premium features with a monthly subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 text-steno-blue animate-spin" />
                </div>
              ) : subscriptionStatus === "active" ? (
                <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                  <p className="text-green-700 font-semibold">
                    You are already subscribed to Raxti Pro!
                  </p>
                  <div className="mt-4">
                    <Button
                      asChild
                      className="w-full bg-steno-blue hover:bg-steno-darkBlue"
                    >
                      <Link href="/pro-dashboard">Go to Pro Dashboard</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-steno-blue/5 rounded-md border border-steno-blue/20">
                    <h3 className="font-medium text-steno-blue mb-2">
                      Raxti Pro - €2.99/month
                    </h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          Advanced audio processing and transcription
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Custom AI prompts for content creation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          Unlimited audio uploads and processing
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          Priority support and faster processing
                        </span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-3">
                      Cancel anytime
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount-code">
                      Discount Code (Optional)
                    </Label>
                    <Input
                      id="discount-code"
                      type="text"
                      placeholder="Enter your discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Have a promo code? Enter it here to get a discount.
                    </p>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-steno-blue hover:bg-steno-darkBlue"
                  >
                    {loading ? "Processing..." : "Subscribe Now"}
                  </Button>
                </div>
              )}

              {/* Debug section */}
              <div className="mt-6 border-t pt-4">
                <button
                  onClick={() => setIsDebugVisible(!isDebugVisible)}
                  className="text-xs text-gray-500 flex items-center"
                >
                  {isDebugVisible ? "Hide" : "Show"} Debugging Information
                </button>

                {isDebugVisible && debugInfo && (
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-48">
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Having Trouble?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              If you&apos;re experiencing issues with your subscription, try
              these steps:
            </p>
            <ul className="mt-2 text-sm space-y-1 text-gray-600">
              <li>1. Check your bank account for successful payment</li>
              <li>
                2. Visit your{" "}
                <Link
                  href="/profile"
                  className="text-steno-blue hover:underline"
                >
                  profile page
                </Link>{" "}
                and refresh subscription status
              </li>
              <li>3. Try signing out and signing back in</li>
              <li>4. Clear your browser cache and cookies</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onOpenChange={() => closeErrorDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Error</DialogTitle>
            <DialogDescription>
              We encountered an error while processing your subscription
              request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5" />
              <p>{errorDialog.message}</p>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Please check your connection and try again. If the problem
              persists, contact support.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={closeErrorDialog}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
