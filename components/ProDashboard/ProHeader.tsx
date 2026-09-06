"use client";


import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface ProHeaderProps {
  user: User;
}

const ProHeader = ({ user }: ProHeaderProps) => {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Pro Dashboard</span>
          <span className="block text-steno-blue text-2xl sm:text-3xl mt-3">
            Advanced audio processing for professionals
          </span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Welcome back, {user.user_metadata?.full_name || user.email}! Process unlimited audio files with Pro features.
        </p>
      </div>

      <Alert className="mb-4 bg-green-50 border-green-200">
        <InfoIcon className="h-4 w-4 text-green-500" />
        <AlertDescription className="ml-2 text-green-700">
          🎉 You're using the PRO version! Enjoy custom prompts, results history and large file support (up to 100MB+).
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ProHeader;
