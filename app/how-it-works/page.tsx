"use client";

import { FileAudio, Languages, ChevronDown, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back button only - logo removed */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-steno-blue hover:text-steno-darkBlue"
            >
              <ArrowLeft size={18} />
              <span>Back to home</span>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            <span className="block">How It Works</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Learn how to use raxti.app to turn your audio into actionable
            insights
          </p>
        </div>

        {/* Hero image */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            <img
              src="/images/how-it-works-1.png"
              alt="How raxti.app works - step by step process"
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* 2 Steps */}
        <div className="mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Just 2 Simple Steps
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="bg-steno-blue text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                1
              </div>
              <p className="text-lg">
                Record audio with your phone&apos;s Voice Memos
              </p>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="bg-steno-blue text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                2
              </div>
              <p className="text-lg">
                Upload and transcribe your file to raxti.app, get actionable
                insights
              </p>
            </div>
          </div>
        </div>

        {/* Supported File Types and Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-steno-blue/10 p-3 rounded-full">
                  <FileAudio className="h-6 w-6 text-steno-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    Supported File Types
                  </h3>
                  <p className="text-gray-600">
                    mp3, mp4, mpeg, mpga, m4a, wav, webm
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Free version file size limit: 25 MB
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                      <li>
                        Low quality / mono voice recording (64 kbps): ~50–55
                        minutes
                      </li>
                      <li>
                        Higher quality / stereo (128 kbps): ~25–27 minutes
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-steno-blue/10 p-3 rounded-full">
                  <Languages className="h-6 w-6 text-steno-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    Supported Languages
                  </h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50">
                      <span>
                        View all {supportedLanguages.length} supported languages
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 opacity-70" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <div className="grid grid-cols-1 gap-1">
                          {supportedLanguages.map((language, index) => (
                            <div key={index} className="px-2 py-1 text-sm">
                              {language}
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <p className="text-gray-600 mt-2">
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
