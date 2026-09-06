"use client";


import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { User } from "@supabase/supabase-js";

interface AudioResult {
  transcript: string;
  summary: string;
  actionItems: string[];
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
}

interface ResultsSaverProps {
  user: User;
}

export const useResultsSaver = ({ user }: ResultsSaverProps) => {
  const saveResult = useCallback(async (
    result: AudioResult,
    fileName: string,
    fileSize: number,
    inputLanguage: string,
    outputLanguage: string
  ) => {
    try {
      console.log("💾 Saving transcription result to database...");
      
      const { data, error } = await supabase
        .from('audio_results')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_size: fileSize,
          transcript: result.transcript,
          summary: result.summary,
          action_items: result.actionItems,
          segments: result.segments || null,
          input_language: inputLanguage,
          output_language: outputLanguage
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving result:', error);
        toast.error('Failed to save transcription result');
        return null;
      }

      console.log('✅ Result saved successfully:', data.id);
      toast.success('Transcription saved to history');
      return data;
    } catch (error) {
      console.error('❌ Unexpected error saving result:', error);
      toast.error('Failed to save transcription result');
      return null;
    }
  }, [user.id]);

  return { saveResult };
};

export default useResultsSaver;
