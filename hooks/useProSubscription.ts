"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const useProSubscription = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { isSubscribed: hasActiveSubscription, isLoading: subLoading, refresh } = useSubscription();

  useEffect(() => {
    // Wait for both auth and subscription checks to finish before any redirect
    if (authLoading || subLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    if (!hasActiveSubscription) {
      toast.error("Pro subscription required");
      router.push("/pro");
    }
  }, [user, authLoading, subLoading, hasActiveSubscription, router]);

  return { user, hasActiveSubscription, isLoading: authLoading || subLoading, refresh };
};
