"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  isLoading: false,
  refresh: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

const CACHE_MS = 5 * 60 * 1000; // 5 minutes

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastChecked = useRef<number>(0);
  const lastUserId = useRef<string | null>(null);

  const checkSubscription = useCallback(async (force = false) => {
    if (!user) {
      setIsSubscribed(false);
      lastChecked.current = 0;
      return;
    }

    const now = Date.now();
    const userChanged = lastUserId.current !== user.id;

    // Skip if within cache window and same user (unless forced)
    if (!force && !userChanged && lastChecked.current && (now - lastChecked.current) < CACHE_MS) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data) {
        setIsSubscribed(data.subscribed || false);
        lastChecked.current = now;
        lastUserId.current = user.id;
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Re-check when user changes
  useEffect(() => {
    checkSubscription();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, isLoading, refresh: () => checkSubscription(true) }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
