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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          toast.error("Session expired, please refresh the page");
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/check-subscription', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          if (data?.error?.includes("User not authenticated")) {
            toast.error("Please sign in again");
            setIsLoading(false);
            router.push('/auth');
            return;
          }
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
      } catch (error) {
        console.error("Unexpected error checking subscription:", error);
        toast.error("Failed to verify subscription status");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user, router, lastCheck]);

  return { hasActiveSubscription, isLoading };
};
