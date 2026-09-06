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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  CreditCard,
  LogOut,
  Calendar,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { isSubscribed, isLoading: subLoading, refresh: refreshSubscription } = useSubscription();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [refreshingSubscription, setRefreshingSubscription] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      fetchSubscription();
    } else {
      router.push("/auth");
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setSubscriptionError(null);

      const { data: stripeData, error: subError } = await supabase.functions.invoke("check-subscription");

      if (subError) {
        console.error("Error calling check-subscription function:", subError);
        setSubscriptionError(`Failed to check subscription: ${subError.message}`);
        throw new Error(subError.message);
      }

      console.log("Stripe subscription data:", stripeData);

      if (stripeData) {
        setSubscription({
          status: stripeData.subscribed ? "active" : "inactive",
          current_period_end: stripeData.subscription_end,
          subscription_tier: stripeData.subscription_tier,
          cancel_at_period_end: stripeData.cancel_at_period_end || false,
        });
      } else {
        setSubscription(null);
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error("Error fetching subscription:", error);
      if (!subscriptionError) {
        setSubscriptionError("Failed to load subscription details");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSavingProfile(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      setRefreshingSubscription(true);
      await refreshSubscription();
      await fetchSubscription();
      toast.success("Subscription status refreshed");
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
      toast.error("Failed to refresh subscription status");
    } finally {
      setRefreshingSubscription(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold">Your Account</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>

        {/* Pro Dashboard Button - Moved to top for better visibility */}
        {subscription && subscription.status === "active" && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-steno-blue to-steno-darkBlue text-white border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">
                  Pro Features Available!
                </h3>
                <p className="mb-4 opacity-90">
                  Access your advanced audio processing tools
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-steno-blue hover:bg-gray-100 hover:text-steno-darkBlue font-semibold px-8 py-3 text-lg"
                >
                  <Link href="/pro-dashboard">Go to Pro Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={updateProfile}
                disabled={savingProfile || !fullName.trim()}
                className="bg-steno-blue hover:bg-steno-darkBlue"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your plan and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 text-steno-blue animate-spin" />
                </div>
              ) : subscriptionError ? (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-700">
                        Error loading subscription
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {subscriptionError}
                      </p>
                      <Button
                        variant="link"
                        className="text-red-600 p-0 h-auto text-sm mt-2"
                        onClick={refreshSubscriptionStatus}
                        disabled={refreshingSubscription}
                      >
                        {refreshingSubscription ? "Retrying..." : "Try again"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : subscription && subscription.status === "active" ? (
                <>
                  {subscription.cancel_at_period_end ? (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                      <p className="font-medium text-amber-700">
                        Subscription Ending
                      </p>
                      <p className="text-sm text-amber-600">
                        Your subscription will end on{" "}
                        {formatDate(subscription.current_period_end)}
                      </p>
                      {subscription.subscription_tier && (
                        <p className="text-sm text-amber-600">
                          Plan: {subscription.subscription_tier}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                      <p className="font-medium text-green-700">
                        Active Subscription
                      </p>
                      <p className="text-sm text-green-600">
                        Status: {subscription.status}
                      </p>
                      {subscription.subscription_tier && (
                        <p className="text-sm text-green-600">
                          Plan: {subscription.subscription_tier}
                        </p>
                      )}
                    </div>
                  )}

                  {subscription.current_period_end && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="text-sm">
                          <span className="font-medium">
                            {subscription.cancel_at_period_end
                              ? "Ends on:"
                              : "Renews on:"}
                          </span>{" "}
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>
                      Last checked:{" "}
                      {lastChecked ? format(lastChecked, "HH:mm:ss") : "Never"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={refreshSubscriptionStatus}
                      disabled={refreshingSubscription}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          refreshingSubscription ? "animate-spin" : ""
                        }`}
                      />
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                    <p className="font-medium text-amber-700">
                      No active subscription
                    </p>
                    <p className="text-sm text-amber-600">
                      Subscribe to access Pro features
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>
                      Last checked:{" "}
                      {lastChecked ? format(lastChecked, "HH:mm:ss") : "Never"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={refreshSubscriptionStatus}
                      disabled={refreshingSubscription}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          refreshingSubscription ? "animate-spin" : ""
                        }`}
                      />
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              {subscription && subscription.status === "active" ? (
                <Button
                  asChild
                  className="w-full bg-steno-blue hover:bg-steno-darkBlue"
                >
                  <Link href="/manage-subscription">
                    Manage Subscription
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/subscribe")}
                  className="w-full bg-steno-blue hover:bg-steno-darkBlue"
                >
                  Subscribe Now
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
