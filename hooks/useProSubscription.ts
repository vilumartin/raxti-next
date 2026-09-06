"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { User } from "@supabase/supabase-js";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const useProSubscription = (user: User | null) => {
  const router = useRouter();
  const { isSubscribed: hasActiveSubscription, isLoading } = useSubscription();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth");
      return;
    }

    // Only redirect away if loading is done AND we confirmed no subscription
    if (!isLoading && user && !hasActiveSubscription) {
      toast.error("Pro subscription required");
      router.push("/pro");
    }
  }, [user, isLoading, hasActiveSubscription, router]);

  return { hasActiveSubscription, isLoading };
};
