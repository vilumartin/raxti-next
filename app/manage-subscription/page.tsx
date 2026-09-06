"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  X,
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageSubscription() {
  const { user } = useAuth();
  const { refresh: refreshSubscription } = useSubscription();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      router.push("/auth");
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: subError } = await supabase.functions.invoke("check-subscription");

      if (subError) {
        console.error("Error calling check-subscription function:", subError);
        setError(`Failed to check subscription: ${subError.message}`);
        throw new Error(subError.message);
      }

      console.log("Subscription data received:", data);

      if (data) {
        setSubscription({
          status: data.subscribed ? "active" : "inactive",
          current_period_end: data.subscription_end,
          subscription_tier: data.subscription_tier,
          cancel_at_period_end: data.cancel_at_period_end || false,
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      if (!error) {
        setError("Failed to load subscription details");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setCancelling(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Error cancelling subscription:", data);
        throw new Error(data?.error || "Failed to cancel subscription");
      }

      if (data?.success) {
        toast.success("Subscription cancelled successfully");
        // Refresh subscription data
        await fetchSubscription();
      } else {
        throw new Error(data?.error || "Failed to cancel subscription");
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      setRefreshing(true);
      await refreshSubscription();
      await fetchSubscription();
      toast.success("Subscription status refreshed");
    } catch (err) {
      console.error("Error refreshing subscription status:", err);
      toast.error("Failed to refresh subscription status");
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <img
                src="/images/logo.png"
                alt="raxti.app logo"
                className="h-16"
              />
            </Link>
            <h1 className="text-3xl font-bold">Manage Subscription</h1>
          </div>
        </div>

        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
        </Button>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-steno-blue animate-spin" />
              <span className="ml-2">Loading subscription details...</span>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-700">
                  Error Loading Subscription
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="space-x-4">
                  <Button
                    onClick={refreshSubscriptionStatus}
                    disabled={refreshing}
                    className="bg-steno-blue hover:bg-steno-darkBlue"
                  >
                    {refreshing ? "Retrying..." : "Try Again"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile">Back to Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : subscription && subscription.status === "active" ? (
          <div className="space-y-6">
            {/* Active Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  {subscription.cancel_at_period_end
                    ? "Subscription Ending"
                    : "Active Subscription"}
                </CardTitle>
                <CardDescription>
                  {subscription.cancel_at_period_end
                    ? "Your subscription will end at the current billing period"
                    : "Manage your current subscription"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Plan:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {subscription.subscription_tier || "Basic"}
                      </span>
                    </div>
                  </div>

                  {subscription.current_period_end && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium">
                          {subscription.cancel_at_period_end
                            ? "Ends:"
                            : "Renews:"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  )}
                </div>

                {subscription.cancel_at_period_end ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Your subscription has been cancelled and will end on{" "}
                      {formatDate(subscription.current_period_end)}. You will
                      continue to have access to premium features until then.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription is active and will automatically renew
                      on the date shown above.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={refreshSubscriptionStatus}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                    Refresh Status
                  </Button>

                  {!subscription.cancel_at_period_end && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={cancelling}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel Subscription
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel your subscription?
                            This action cannot be undone. You will lose access
                            to premium features at the end of your current
                            billing period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Keep Subscription
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={cancelSubscription}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={cancelling}
                          >
                            {cancelling ? "Cancelling..." : "Yes, Cancel"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-600 mb-6">
                You don&apos;t have an active subscription to manage.
              </p>
              <div className="space-x-4">
                <Button
                  asChild
                  className="bg-steno-blue hover:bg-steno-darkBlue"
                >
                  <Link href="/subscribe">Subscribe Now</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/profile">Back to Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
