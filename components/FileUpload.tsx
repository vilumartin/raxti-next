"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CloudUpload, ArrowRight, X, RefreshCcw, AlertCircle } from 'lucide-react';
import AudioPreview from './AudioPreview';
import LanguageSelector from './LanguageSelector';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onProcess: () => void;
  file: File | null;
  isProcessing: boolean;
  onInputLanguageChange?: (language: string) => void;
  onOutputLanguageChange?: (language: string) => void;
  selectedInputLanguage?: string;
  selectedOutputLanguage?: string;
}

const FileUpload = ({ 
  onFileSelected, 
  onProcess, 
  file, 
  isProcessing,
  onInputLanguageChange,
  onOutputLanguageChange,
  selectedInputLanguage = "auto",
  selectedOutputLanguage = "en"
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formatError, setFormatError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear the progress interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        simulateUpload(droppedFile);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        simulateUpload(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      // MP3 / MPEG
      'audio/mp3', 'audio/mpeg', 'audio/mpga',
      // M4A / MP4 audio
      'audio/x-m4a', 'audio/mp4', 'audio/m4a',
      // WAV
      'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/vnd.wave',
      // WebM
      'audio/webm', 'video/webm',
      // FLAC – Whisper + all major browsers support it
      'audio/flac', 'audio/x-flac',
      // OGG / Opus – Whisper supports both; Chrome & Firefox decode for large files
      'audio/ogg', 'audio/opus', 'application/ogg',
    ];

    // Extension fallback — OS/browser MIME types can be unreliable
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'flac', 'ogg', 'opus'];

    const isMimeTypeValid = validTypes.includes(file.type);
    const isExtensionValid = fileExtension && validExtensions.includes(fileExtension);

    if (!isMimeTypeValid && !isExtensionValid) {
      setFormatError("Unsupported format. Accepted: MP3, M4A, WAV, FLAC, OGG, WebM.");
      return false;
    }
    setFormatError(null);
    return true;
  };
  
  const simulateUpload = (selectedFile: File) => {
    // Cancel any previous in-flight progress bar
    if (intervalRef.current) clearInterval(intervalRef.current);
    setUploadProgress(0);
    intervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          onFileSelected(selectedFile);
          return 100;
        }
        return newProgress;
      });
    }, 50);
  };

  const handleChangeFile = () => {
    // Cancel any in-flight progress bar before clearing the file
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setFormatError(null);
    onFileSelected(null as any);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-6">
      {!file ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-52 cursor-pointer
                     ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60 hover:bg-muted/30'} transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload className="h-12 w-12 text-muted-foreground mb-3" />
          <div className="text-center">
            {/* Desktop: drag-and-drop copy */}
            <p className="hidden sm:block text-lg text-muted-foreground mb-1">
              Drag and drop your audio file here
            </p>
            <p className="hidden sm:block text-sm text-muted-foreground">
              or click to select a file
            </p>
            {/* Mobile: tap-to-select copy */}
            <p className="sm:hidden text-lg font-medium text-foreground mb-1">
              Tap to select your audio file
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              MP3 · M4A · WAV · FLAC · OGG · WebM
            </p>
          </div>
          {/* Visible button on desktop only — whole zone is tappable on mobile */}
          <Button
            variant="outline"
            className="mt-4 hidden sm:inline-flex"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Select File
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm,.flac,.ogg,.opus"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">Selected File</h3>
            <Button variant="ghost" size="sm" onClick={handleChangeFile}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
          
          <AudioPreview file={file} />
          
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{file.name}</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>
        </div>
      )}
      
      {formatError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formatError}</span>
          <button onClick={() => setFormatError(null)} className="ml-auto text-destructive/60 hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && !file && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {file && onInputLanguageChange && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LanguageSelector 
            onLanguageChange={onInputLanguageChange}
            selectedLanguage={selectedInputLanguage}
            label="Transcription Language"
            id="input-language-select"
          />
          {onOutputLanguageChange && (
            <LanguageSelector 
              onLanguageChange={onOutputLanguageChange}
              selectedLanguage={selectedOutputLanguage}
              label="Summary & Action Items Language"
              id="output-language-select"
            />
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        {file && (
          <Button
            onClick={onProcess}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/80"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                Transcribe and Analyze
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
