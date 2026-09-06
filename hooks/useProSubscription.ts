"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { User } from "@supabase/supabase-js";

export const useProSubscription = (user: User | null) => {
  const router = useRouter();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<number>(0);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        router.push('/auth');
        return;
      }

      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      if (lastCheck && (now - lastCheck) < fiveMinutes) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');

        if (error) {
          toast.error("Failed to verify subscription status");
          setIsLoading(false);
          return;
        }

        setLastCheck(now);

        if (!data?.subscribed) {
          toast.error("Pro subscription required");
          setIsLoading(false);
          router.push('/pro');
          return;
        }

        setHasActiveSubscription(true);
      } catch (err) {
        console.error("Unexpected error checking subscription:", err);
        toast.error("Failed to verify subscription status");
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user, router, lastCheck]);

  return { hasActiveSubscription, isLoading };
};
