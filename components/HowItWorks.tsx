"use client";


import { FileAudio, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
  return (
    <div className="mt-16 mb-12">
      <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <img 
              src="/images/how-it-works-2.png" 
              alt="How Stenograph works" 
              className="w-full h-auto"
            />
          </div>
        </div>
        
        <div className="flex flex-col items-start lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FileAudio className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Supported File Types</h3>
                    <p className="text-muted-foreground">
                      mp3, mp4, mpeg, mpga, m4a, wav, webm
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Languages className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Supported Languages</h3>
                    <p className="text-muted-foreground">
                      English, Spanish, French, German, Italian, Portuguese, and many more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-200 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
              <p className="text-lg">Record audio with your phone's Voice Memos</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-gray-200 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-bold">2</div>
              <p className="text-lg">Upload and transcribe your file to raxti.app, get actionable insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
