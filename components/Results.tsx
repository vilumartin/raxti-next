"use client";


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';
import PromptProcessor from '@/components/PromptProcessor';
import DownloadDropdown from './Results/DownloadDropdown';
import ActionItemsDownloadDropdown from './Results/ActionItemsDownloadDropdown';
import ActionItemsList from './Results/ActionItemsList';
import { removeAsterisks, formatActionItemsForDownload, handleDownload, generateSRT } from './Results/downloadUtils';

interface ResultsProps {
  results: {
    transcript: string;
    summary: string;
    actionItems: string[];
    segments?: {
      id: number;
      start: number;
      end: number;
      text: string;
    }[];
  };
  onReset: () => void;
  userId?: string;
  inputLanguage?: string;
  outputLanguage?: string;
  hasActiveSubscription?: boolean;
}

const Results = ({ results, onReset, userId, inputLanguage, outputLanguage, hasActiveSubscription = false }: ResultsProps) => {
  const [activeTab, setActiveTab] = useState('transcript');
  const [customResults, setCustomResults] = useState<{ summary: string; actionItems: string[] } | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${type} — please copy manually`);
    }
  };

  const handleCustomResults = (newResults: { summary: string; actionItems: string[] }) => {
    setCustomResults(newResults);
    setActiveTab('customPrompt');
  };

  const formatActionItem = (item: string) => {
    return removeAsterisks(item);
  };

  const addAttributionForFreeUsers = (content: string) => {
    if (!hasActiveSubscription) {
      return content + '\n\nMade with Raxti.app';
    }
    return content;
  };

  // Display content without attribution
  const displaySummary = removeAsterisks(results.summary);
  const displayActionItems = results.actionItems;

  // Helper functions for copy with attribution
  const getCopyableSummary = () => {
    return addAttributionForFreeUsers(removeAsterisks(results.summary));
  };

  const getCopyableActionItems = () => {
    const formattedItems = formatActionItemsForDownload(results.actionItems.map(formatActionItem));
    return addAttributionForFreeUsers(formattedItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Results</h2>
        <Button variant="outline" size="sm" onClick={onReset}>New file</Button>
      </div>
      
      <Tabs defaultValue="transcript" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${hasActiveSubscription ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="transcript" className="text-xs sm:text-sm">Transcript</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs sm:text-sm">Summary</TabsTrigger>
          <TabsTrigger value="actionItems" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Action Items</span>
            <span className="sm:hidden">Actions</span>
          </TabsTrigger>
          {hasActiveSubscription && (
            <TabsTrigger value="customPrompt" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Custom Prompt</span>
              <span className="sm:hidden">Prompt</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="transcript" className="mt-6">
          <Card className="p-4 bg-background border rounded-md shadow-sm">
            <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-foreground">
              {results.transcript}
            </div>
            <div className="flex flex-wrap justify-end gap-2 mt-4 border-t pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(results.transcript, 'Transcript')}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <DownloadDropdown 
                content={results.transcript} 
                baseFilename="transcript" 
                title="Transcript"
              />
              {results.segments && results.segments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const srtContent = generateSRT(results.segments!);
                    if (srtContent) {
                      handleDownload(srtContent, 'transcript.srt', 'txt');
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" /> Download SRT
                </Button>
              )}
            </div>
          </Card>
          
          {hasActiveSubscription && (
            <PromptProcessor 
              transcript={results.transcript}
              onResults={handleCustomResults}
              userId={userId}
              inputLanguage={inputLanguage}
              outputLanguage={outputLanguage}
            />
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          <Card className="p-4 bg-background border rounded-md shadow-sm">
            <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-foreground">
              {displaySummary}
            </div>
            <div className="flex flex-wrap justify-end gap-2 mt-4 border-t pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(getCopyableSummary(), 'Summary')}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <DownloadDropdown 
                content={removeAsterisks(results.summary)} 
                baseFilename="summary" 
                title="Summary"
              />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="actionItems" className="mt-6">
          <Card className="p-4 bg-background border rounded-md shadow-sm">
            <ActionItemsList items={displayActionItems} />
            <div className="flex flex-wrap justify-end gap-2 mt-4 border-t pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(getCopyableActionItems(), 'Action Items')}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <ActionItemsDownloadDropdown 
                items={results.actionItems.map(formatActionItem)} 
                baseFilename="action-items"
              />
            </div>
          </Card>
        </TabsContent>

        {hasActiveSubscription && (
          <TabsContent value="customPrompt" className="mt-6">
            {customResults ? (
              <div className="space-y-4">
                <Card className="p-4 bg-background border rounded-md shadow-sm">
                  <h3 className="font-semibold mb-3 text-foreground">Custom Analysis</h3>
                  <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-foreground">
                    {removeAsterisks(customResults.summary)}
                  </div>
                  <div className="flex justify-end space-x-3 mt-4 border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopy(removeAsterisks(customResults.summary), 'Custom Analysis')}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                    <DownloadDropdown 
                      content={removeAsterisks(customResults.summary)} 
                      baseFilename="custom-analysis" 
                      title="Custom Analysis"
                    />
                  </div>
                </Card>

                {customResults.actionItems && customResults.actionItems.length > 0 && (
                  <Card className="p-4 bg-background border rounded-md shadow-sm">
                    <h3 className="font-semibold mb-3 text-foreground">Action Items</h3>
                    <ActionItemsList items={customResults.actionItems} />
                    <div className="flex justify-end space-x-3 mt-4 border-t pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopy(formatActionItemsForDownload(customResults.actionItems.map(formatActionItem)), 'Custom Action Items')}
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                      <ActionItemsDownloadDropdown 
                        items={customResults.actionItems.map(formatActionItem)} 
                        baseFilename="custom-action-items"
                      />
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center bg-muted/50 border-2 border-dashed">
                <p className="text-muted-foreground mb-4">No custom analysis generated yet.</p>
                <p className="text-sm text-muted-foreground">Use the "Generate Custom Analysis" section in the Transcript tab to create content with specific prompts.</p>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Results;
