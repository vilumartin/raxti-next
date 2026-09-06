"use client";


import { Card, CardContent } from "@/components/ui/card";
import { FileAudio } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Results History</h2>
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p>No audio processing results yet.</p>
          <p className="text-sm">Process some audio files to see your history here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;
