"use client";

import { FileAudio, Languages, ChevronDown, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HowItWorksPage = () => {
  const supportedLanguages = [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Assamese",
    "Azerbaijani", "Bashkir", "Basque", "Belarusian", "Bengali", "Bosnian",
    "Breton", "Bulgarian", "Burmese", "Catalan", "Chinese (Simplified)",
    "Chinese (Traditional)", "Croatian", "Czech", "Danish", "Dutch", "English",
    "Estonian", "Faroese", "Finnish", "French", "Galician", "Georgian", "German",
    "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi",
    "Hungarian", "Icelandic", "Indonesian", "Italian", "Japanese", "Javanese",
    "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish", "Kyrgyz",
    "Lao", "Latin", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian",
    "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian",
    "Nepali", "Norwegian", "Nyanja", "Occitan", "Pashto", "Persian", "Polish",
    "Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic",
    "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian",
    "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tagalog (Filipino)",
    "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian",
    "Urdu", "Uzbek", "Vietnamese", "Welsh", "Western Frisian", "Xhosa", "Yiddish",
    "Yoruba", "Zulu",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activePage="how-it-works" />
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-primary hover:text-primary/80"
            >
              <ArrowLeft size={18} />
              <span>Back to home</span>
            </Button>
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How It Works
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Learn how to use raxti.app to turn your audio into actionable insights
          </p>
        </div>

        {/* Hero image */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-4xl">
            <img
              src="/images/how-it-works-1.png"
              alt="How raxti.app works - step by step process"
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* 2 Steps */}
        <div className="mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
            Just 2 Simple Steps
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg shadow-sm">
              <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <p className="text-lg text-foreground">
                Record audio with your phone&apos;s Voice Memos
              </p>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg shadow-sm">
              <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <p className="text-lg text-foreground">
                Upload and transcribe your file to raxti.app, get actionable insights
              </p>
            </div>
          </div>
        </div>

        {/* Supported File Types and Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <FileAudio className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-lg mb-2 text-foreground">
                    Supported File Types
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    MP3 · M4A · WAV · FLAC · OGG · WebM
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Files up to 25 MB are sent directly to Whisper — all formats
                    above work in every browser. Larger files are decoded in your
                    browser first: MP3, M4A, WAV and FLAC work everywhere; WebM
                    and OGG require Chrome or Firefox (not Safari).
                  </p>
                  <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Free version file size limit: 25 MB
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Low quality / mono voice recording (64 kbps): ~50–55 minutes</li>
                      <li>Higher quality / stereo (128 kbps): ~25–27 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 w-full">
                  <h3 className="font-medium text-lg mb-2 text-foreground">
                    Supported Languages
                  </h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm bg-background border border-border rounded-md hover:bg-muted text-foreground transition-colors">
                      <span>View all {supportedLanguages.length} supported languages</span>
                      <ChevronDown className="w-4 h-4 ml-2 opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <div className="grid grid-cols-1 gap-1">
                          {supportedLanguages.map((language, index) => (
                            <div key={index} className="px-2 py-1 text-sm text-foreground">
                              {language}
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <p className="text-muted-foreground mt-2 text-sm">
                    Including Latvian, Estonian, Lithuanian, English, Spanish,
                    French, German, Italian, Portuguese, and many more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
