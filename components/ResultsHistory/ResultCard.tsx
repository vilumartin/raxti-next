"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, FileAudio, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AudioResult, formatFileSize } from "./utils";

interface ResultCardProps {
  result: AudioResult;
  onDelete: (id: string) => void;
  onSelect: (result: AudioResult) => void;
}

const ResultCard = ({ result, onDelete, onSelect }: ResultCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            {result.file_name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(result.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatFileSize(result.file_size)}
          </div>
          <Badge variant="secondary">
            {result.input_language} → {result.output_language}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium mb-1">Summary</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{result.summary}</p>
        </div>
        {result.action_items && result.action_items.length > 0 && (
          <div>
            <h4 className="font-medium mb-1">Action Items ({result.action_items.length})</h4>
            <p className="text-sm text-gray-600 line-clamp-1">
              {result.action_items[0]}{result.action_items.length > 1 ? '...' : ''}
            </p>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(result)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;
