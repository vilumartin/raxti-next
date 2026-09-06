
import { Json } from "@/integrations/supabase/types";

export interface AudioResult {
  id: string;
  file_name: string;
  file_size: number;
  transcript: string;
  summary: string;
  action_items: string[];
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
  input_language: string;
  output_language: string;
  created_at: string;
}

// Type guard for segment objects
export function isValidSegment(segment: any): segment is {
  id: number;
  start: number;
  end: number;
  text: string;
} {
  return (
    typeof segment === 'object' &&
    segment !== null &&
    typeof segment.id === 'number' &&
    typeof segment.start === 'number' &&
    typeof segment.end === 'number' &&
    typeof segment.text === 'string'
  );
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const transformDatabaseResult = (item: any): AudioResult => {
  // Safely handle action_items - ensure it's an array of strings
  let actionItems: string[] = [];
  if (Array.isArray(item.action_items)) {
    actionItems = item.action_items
      .filter((actionItem: unknown): actionItem is string => typeof actionItem === 'string');
  }

  // Safely handle segments - ensure it matches expected structure
  let segments: AudioResult['segments'] = undefined;
  if (Array.isArray(item.segments)) {
    segments = item.segments
      .filter((segment: unknown): boolean => {
        // First check if it's an object before accessing properties
        if (typeof segment !== 'object' || segment === null) return false;
        
        // Now safely check if it has the required properties with correct types
        const segmentObj = segment as Record<string, unknown>;
        return (
          typeof segmentObj.id === 'number' &&
          typeof segmentObj.start === 'number' &&
          typeof segmentObj.end === 'number' &&
          typeof segmentObj.text === 'string'
        );
      })
      .map((segment: unknown) => {
        // Since we've already validated the structure, we can safely cast
        const segmentObj = segment as Record<string, unknown>;
        return {
          id: segmentObj.id as number,
          start: segmentObj.start as number,
          end: segmentObj.end as number,
          text: segmentObj.text as string
        };
      });
  }

  return {
    id: item.id,
    file_name: item.file_name,
    file_size: item.file_size || 0,
    transcript: item.transcript,
    summary: item.summary,
    action_items: actionItems,
    segments: segments,
    input_language: item.input_language || 'en',
    output_language: item.output_language || 'en',
    created_at: item.created_at
  };
};
