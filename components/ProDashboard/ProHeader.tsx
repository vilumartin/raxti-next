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
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          <span className="block">Pro Dashboard</span>
          <span className="block text-primary text-base sm:text-2xl mt-2">
            Advanced audio processing for professionals
          </span>
        </h1>
        <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground sm:text-base md:mt-4 md:max-w-3xl">
          Welcome back, {user.user_metadata?.full_name || user.email}!
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
