"use client";


import { useAuth } from "@/contexts/AuthContext";
import { useResultsData } from "./ResultsHistory/useResultsData";
import { AudioResult } from "./ResultsHistory/utils";
import EmptyState from "./ResultsHistory/EmptyState";
import LoadingState from "./ResultsHistory/LoadingState";
import ResultCard from "./ResultsHistory/ResultCard";

interface ResultsHistoryProps {
  onSelectResult: (result: AudioResult) => void;
}

const ResultsHistory = ({ onSelectResult }: ResultsHistoryProps) => {
  const { user } = useAuth();
  const { results, isLoading, deleteResult } = useResultsData();

  console.log("ResultsHistory rendering state:", { 
    isAuthenticated: !!user, 
    userId: user?.id,
    isLoading, 
    resultsCount: results.length 
  });

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">You need to be logged in to view results history.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (results.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Results History ({results.length})</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            onDelete={deleteResult}
            onSelect={onSelectResult}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsHistory;
