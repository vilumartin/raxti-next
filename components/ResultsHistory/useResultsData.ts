
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { AudioResult, transformDatabaseResult } from "./utils";

export const useResultsData = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<AudioResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResults();
    } else {
      // No user logged in, clear results
      setResults([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      console.log("Fetching audio results for user:", user?.id);
      
      const { data, error } = await supabase
        .from('audio_results')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to load results history');
        return;
      }

      console.log("Fetched results:", data?.length || 0, "items");

      // Transform the data to match our interface with proper type handling
      const transformedResults: AudioResult[] = (data || []).map(transformDatabaseResult);

      setResults(transformedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results history');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('audio_results')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting result:', error);
        toast.error('Failed to delete result');
        return;
      }

      setResults(results.filter(result => result.id !== id));
      toast.success('Result deleted successfully');
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    }
  };

  return {
    results,
    isLoading,
    deleteResult
  };
};
