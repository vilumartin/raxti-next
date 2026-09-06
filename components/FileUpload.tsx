"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CloudUpload, ArrowRight, X, RefreshCcw } from 'lucide-react';
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
  selectedInputLanguage = "en",
  selectedOutputLanguage = "en"
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      'audio/mp3',
      'audio/mpeg',
      'audio/mpga',
      'audio/x-m4a',
      'audio/mp4',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/vnd.wave',
      'audio/webm'
    ];
    
    // Also check file extension as a fallback since MIME types can vary
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
    
    const isMimeTypeValid = validTypes.includes(file.type);
    const isExtensionValid = fileExtension && validExtensions.includes(fileExtension);
    
    if (!isMimeTypeValid && !isExtensionValid) {
      alert("Please select a supported audio file format: mp3, mp4, mpeg, mpga, m4a, wav, or webm");
      return false;
    }
    return true;
  };
  
  const simulateUpload = (selectedFile: File) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          onFileSelected(selectedFile);
          return 100;
        }
        return newProgress;
      });
    }, 50);
  };

  const handleChangeFile = () => {
    // Reset to initial view by clearing the file
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
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 
                     ${isDragging ? 'border-steno-blue bg-steno-blue/5' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUpload className="h-12 w-12 text-gray-400 mb-3" />
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-1">
              Drag and drop your audio file here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select File
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm"
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
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{file.name}</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>
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
            className="bg-steno-blue hover:bg-steno-darkBlue"
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
