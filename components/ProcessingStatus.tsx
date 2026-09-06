"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingStatusProps {
  isProcessing: boolean;
  fileSizeMB: number;
  isPro: boolean;
  onRetry?: () => void;
  customMessage?: string;
}

interface EdgeLog {
  event_message: string;
  timestamp: number;
  level: string;
}

const ProcessingStatus = ({ isProcessing, fileSizeMB, isPro, onRetry, customMessage }: ProcessingStatusProps) => {
  const [currentHaiku, setCurrentHaiku] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [edgeLogs, setEdgeLogs] = useState<EdgeLog[]>([]);
  const [isStalled, setIsStalled] = useState(false);
  const [lastLogTime, setLastLogTime] = useState<number | null>(null);

  const haikus = [
    {
      lines: [
        "Audio whispers",
        "Transform to written wisdom—",
        "Raxti understands"
      ]
    },
    {
      lines: [
        "Voice becomes clear text",
        "AI listens, then translates—",
        "Knowledge flows freely"
      ]
    },
    {
      lines: [
        "Words dance in the cloud",
        "Machine learning captures all—",
        "Meaning crystallized"
      ]
    },
    {
      lines: [
        "Silence broken soft",
        "Raxti breathes life into sound—",
        "Stories emerge bright"
      ]
    },
    {
      lines: [
        "Digital ears hear",
        "Every nuance, every pause—",
        "Perfect transcription"
      ]
    },
    {
      lines: [
        "Bytes flow like water",
        "Through neural networks they dance—",
        "Intelligence born"
      ]
    },
    {
      lines: [
        "Patient algorithms",
        "Weave magic from spoken words—",
        "Time moves like honey"
      ]
    },
    {
      lines: [
        "Coffee grows cold while",
        "Servers process your audio—",
        "Soon wisdom awaits"
      ]
    },
    {
      lines: [
        "In silicon dreams",
        "Your voice becomes eternal—",
        "Digital memory"
      ]
    },
    {
      lines: [
        "Electrons spinning",
        "Decode the rhythm of speech—",
        "Language understood"
      ]
    },
    {
      lines: [
        "Time bends and stretches",
        "While computers think deeply—",
        "Patience bears sweet fruit"
      ]
    },
    {
      lines: [
        "Code poetry flows",
        "Transforming sound into text—",
        "Art meets technology"
      ]
    }
  ];

  // Fetch edge function logs
  const fetchEdgeLogs = async () => {
    try {
      // This would need to be implemented as an edge function to fetch logs
      // For now, we'll simulate based on common processing steps
      const response = await fetch('/api/edge-logs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const logs = await response.json();
        setEdgeLogs(logs);
        
        if (logs.length > 0) {
          setLastLogTime(Date.now());
        }
      }
    } catch (error) {
      console.error('Failed to fetch edge logs:', error);
    }
  };

  // Get current processing step based on file size and type
  const getCurrentStep = () => {
    if (customMessage) {
      return customMessage;
    }
    
    if (fileSizeMB > 25 && isPro) {
      return `Processing large file (${fileSizeMB.toFixed(1)}MB) with PRO chunking...`;
    } else if (fileSizeMB > 15) {
      return `Processing substantial file (${fileSizeMB.toFixed(1)}MB)...`;
    } else {
      return `Processing audio file (${fileSizeMB.toFixed(1)}MB)...`;
    }
  };

  // Get the latest meaningful log message
  const getLatestLogMessage = () => {
    if (edgeLogs.length === 0) {
      return getCurrentStep();
    }

    const latestLog = edgeLogs[edgeLogs.length - 1];
    
    // Clean up log messages for user display
    let message = latestLog.event_message;
    
    if (message.includes('Sending chunk')) {
      const chunkMatch = message.match(/chunk (\d+)/);
      const sizeMatch = message.match(/size: (\d+) bytes/);
      if (chunkMatch && sizeMatch) {
        const sizeMB = (parseInt(sizeMatch[1]) / (1024 * 1024)).toFixed(1);
        return `Processing chunk ${chunkMatch[1]} (${sizeMB}MB)...`;
      }
      return 'Processing audio chunks...';
    }
    
    if (message.includes('Transcription completed')) {
      return 'Transcription completed, generating summary...';
    }
    
    if (message.includes('Summary and action items generated')) {
      return 'Almost done, finalizing results...';
    }
    
    if (message.includes('Starting transcription')) {
      return 'Starting audio transcription...';
    }
    
    if (message.includes('chunking')) {
      return 'Preparing large file for processing...';
    }
    
    // Clean up technical messages
    message = message.replace(/[🎵📡✅❌🔄📊📋📍🚀📥📞]/g, '').trim();
    message = message.replace(/^(Log|Info|Error):\s*/i, '');
    
    return message || getCurrentStep();
  };

  // Estimate processing time based on file size
  const getEstimatedTime = () => {
    if (customMessage) {
      return "1-3 minutes";
    }
    if (fileSizeMB < 5) return "1-2 minutes";
    if (fileSizeMB < 15) return "2-4 minutes";
    if (fileSizeMB < 25) return "3-6 minutes";
    return "5-10 minutes (large file)";
  };

  useEffect(() => {
    if (!isProcessing) {
      setProcessingTime(0);
      setEdgeLogs([]);
      setIsStalled(false);
      setLastLogTime(null);
      return;
    }

    // Start timing
    const startTime = Date.now();
    const timeInterval = setInterval(() => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Fetch logs periodically
    const logInterval = setInterval(fetchEdgeLogs, 3000);
    
    // Initial log fetch
    fetchEdgeLogs();

    // Check for stalled processing
    const stallCheckInterval = setInterval(() => {
      if (lastLogTime && Date.now() - lastLogTime > 120000) { // 2 minutes without logs
        setIsStalled(true);
      }
    }, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(logInterval);
      clearInterval(stallCheckInterval);
    };
  }, [isProcessing, lastLogTime]);

  useEffect(() => {
    if (!isProcessing) return;

    const haikuInterval = setInterval(() => {
      setCurrentHaiku(prev => (prev + 1) % haikus.length);
    }, 4000);

    return () => clearInterval(haikuInterval);
  }, [isProcessing, haikus.length]);

  if (!isProcessing) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Loader className="h-6 w-6 animate-spin text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                {customMessage ? "Processing YouTube Video" : "Processing Your Audio"}
              </h3>
            </div>
            {fileSizeMB > 25 && isPro && !customMessage && (
              <p className="text-sm text-primary font-medium">
                Large file detected - Using PRO chunking feature
              </p>
            )}
          </div>

          {/* Current Processing Step */}
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">
              {getLatestLogMessage()}
            </p>
            <p className="text-sm text-muted-foreground">
              Estimated time: {getEstimatedTime()}
            </p>
          </div>

          {/* Processing Status */}
          <div className="bg-background/70 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Processing Time</span>
              <span className="text-sm text-muted-foreground">{formatTime(processingTime)}</span>
            </div>
            
            {isStalled && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400 mb-2">
                  Processing seems to have stalled. This can happen with very large files or when OpenAI's servers are busy.
                </p>
                {onRetry && (
                  <Button 
                    onClick={onRetry} 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Processing
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Recent Logs */}
          {edgeLogs.length > 0 && (
            <div className="bg-background/70 rounded-lg p-4 border border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Processing Log
              </p>
              <div className="space-y-1 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                {edgeLogs.slice(-5).map((log, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="truncate">{log.event_message.replace(/[🎵📡✅❌🔄📊📋📍🚀📥📞]/g, '').trim()}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Haiku Display */}
          <div className="bg-background/70 rounded-lg p-6 text-center border border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              While you wait, enjoy this haiku
            </p>
            <div className="space-y-1">
              {haikus[currentHaiku].lines.map((line, index) => (
                <p key={index} className="text-foreground italic">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* File Info */}
          <div className="text-center text-sm text-muted-foreground">
            {!customMessage && <p>File size: {fileSizeMB.toFixed(2)} MB</p>}
            {isPro && <p className="text-primary font-medium">PRO Processing Active</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingStatus;
