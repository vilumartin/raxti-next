"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { UsageCounter } from "./UsageCounter";

interface ProHeaderProps {
  user: User;
}

const ProHeader = ({ user }: ProHeaderProps) => {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <span className="block">Pro Dashboard</span>
          <span className="block text-primary text-2xl sm:text-3xl mt-3">
            Advanced audio processing for professionals
          </span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Welcome back, {user.user_metadata?.full_name || user.email}! Process unlimited audio files with Pro features.
        </p>
      </div>

      <Alert className="mb-4 bg-green-500/10 border-green-500/30">
        <InfoIcon className="h-4 w-4 text-green-400" />
        <AlertDescription className="ml-2 text-green-400 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            PRO — large files decoded in your browser (MP3, M4A, WAV, FLAC in all browsers; WebM/OGG in Chrome &amp; Firefox).
          </span>
          <div className="min-w-[200px]">
            <UsageCounter userId={user.id} />
          </div>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ProHeader;
