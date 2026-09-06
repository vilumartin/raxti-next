"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PromptProcessorProps {
  transcript: string;
  onResults: (results: { summary: string; actionItems: string[] }) => void;
  userId?: string;
  inputLanguage?: string;
  outputLanguage?: string;
}

const predefinedPrompts = [
  // Business & Work
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    category: '🧑‍💼 Business & Work',
    description: 'Summarize a work meeting with key decisions and action items.',
    prompt: 'Summarize this work meeting transcript with key decisions made and specific action items. Focus on who needs to do what by when, important announcements, and strategic decisions discussed.'
  },
  {
    id: 'sales-call',
    name: 'Sales Call',
    category: '🧑‍💼 Business & Work',
    description: 'Extract pain points, objections, buying signals, and next steps.',
    prompt: 'Analyze this sales call transcript to extract customer pain points, objections raised, buying signals, solutions presented, and clear next steps for the sales process.'
  },
  {
    id: 'investor-call',
    name: 'Investor Call',
    category: '🧑‍💼 Business & Work',
    description: 'Summarize the pitch, questions, concerns, and follow-ups.',
    prompt: 'Summarize this investor call focusing on the pitch presented, investor questions and concerns raised, business metrics discussed, and specific follow-up actions required.'
  },
  {
    id: 'coaching-session',
    name: '1-on-1 Coaching Session',
    category: '🧑‍💼 Business & Work',
    description: 'Highlight feedback, advice, and development goals.',
    prompt: 'Extract key feedback given, advice shared, development goals set, and action items from this coaching session. Highlight areas for improvement and growth opportunities discussed.'
  },
  {
    id: 'client-briefing',
    name: 'Client Briefing',
    category: '🧑‍💼 Business & Work',
    description: 'Capture project scope, client needs, and next actions.',
    prompt: 'Capture the project scope discussed, client needs and requirements, expectations set, and next actions from this client briefing meeting.'
  },
  {
    id: 'job-interview',
    name: 'Job Interview',
    category: '🧑‍💼 Business & Work',
    description: 'Summarize candidate strengths, weaknesses, and fit.',
    prompt: 'Summarize the candidate\'s strengths and weaknesses, cultural fit assessment, technical skills discussed, and overall interview performance from this job interview.'
  },
  {
    id: 'standup-summary',
    name: 'Daily Standup Summary',
    category: '🧑‍💼 Business & Work',
    description: 'Extract blockers, team updates, and task assignments.',
    prompt: 'Extract team updates, current blockers, task assignments, and progress updates from this daily standup meeting. Organize by team member contributions.'
  },
  {
    id: 'user-research',
    name: 'User Research Interview',
    category: '🧑‍💼 Business & Work',
    description: 'Identify key insights, pain points, quotes, and themes.',
    prompt: 'Identify key user insights, pain points discovered, memorable quotes, behavioral patterns, and emerging themes from this user research interview.'
  },
  {
    id: 'design-review',
    name: 'Design Review',
    category: '🧑‍💼 Business & Work',
    description: 'Outline feedback and recommended improvements.',
    prompt: 'Outline design feedback provided, recommended improvements, design decisions made, and next iteration steps from this design review session.'
  },
  {
    id: 'strategic-planning',
    name: 'Strategic Planning',
    category: '🧑‍💼 Business & Work',
    description: 'Extract long-term goals, key decisions, and concerns.',
    prompt: 'Extract long-term goals discussed, key strategic decisions made, concerns raised, and action items from this strategic planning session.'
  },

  // Media & Content
  {
    id: 'lecture',
    name: 'Lecture Summary',
    category: '🎤 Media & Content',
    description: 'Summarize key points and learning objectives.',
    prompt: 'Analyze this lecture transcript and provide a comprehensive summary focusing on key concepts, main topics, learning objectives, and important takeaways. Format as educational content suitable for study notes.'
  },
  {
    id: 'podcast',
    name: 'Podcast in Brief',
    category: '🎤 Media & Content',
    description: 'Create a short summary, topics covered, and quotes.',
    prompt: 'Create a concise podcast summary highlighting the main topics discussed, key guest insights, memorable quotes, and actionable advice shared during the episode.'
  },
  {
    id: 'interview',
    name: 'Interview',
    category: '🎤 Media & Content',
    description: 'Pull out highlights, context, and insights.',
    prompt: 'Process this interview transcript and extract key insights, main discussion points, important revelations, and memorable quotes. Summarize the conversation flow and highlights.'
  },
  {
    id: 'conference',
    name: 'Conference Stage Recording',
    category: '🎤 Media & Content',
    description: 'Summarize the talk and extract quotable insights.',
    prompt: 'Process this conference presentation transcript to highlight main presentation topics, speaker insights, key industry trends discussed, and quotable moments from the talk.'
  },
  {
    id: 'book-notes',
    name: 'Book Notes',
    category: '🎤 Media & Content',
    description: 'Summarize main ideas and author arguments.',
    prompt: 'Summarize the main ideas, key arguments, important concepts, and actionable insights from this book discussion or reading session.'
  },
  {
    id: 'course-notes',
    name: 'Learning Log / Course Notes',
    category: '🎤 Media & Content',
    description: 'Turn educational audio into review notes and highlights.',
    prompt: 'Turn this educational audio into structured review notes with key concepts, learning highlights, important definitions, and study points for future reference.'
  },

  // Creative & Personal
  {
    id: 'creative',
    name: 'Creative Ideas Dump',
    category: '🎨 Creative & Personal',
    description: 'Organize random ideas into categories and themes.',
    prompt: 'Extract and organize all creative ideas, brainstorming concepts, innovative suggestions, and potential solutions mentioned. Group similar ideas into themes and categories.'
  },
  {
    id: 'voice-journal',
    name: 'Voice Journaling',
    category: '🎨 Creative & Personal',
    description: 'Summarize emotions, events, and mindset tags.',
    prompt: 'Summarize the emotions expressed, events discussed, personal reflections, and mindset themes from this voice journal entry. Create emotional and situational tags.'
  },
  {
    id: 'dream-log',
    name: 'Dream Log Summary',
    category: '🎨 Creative & Personal',
    description: 'Summarize the dream with emotional themes and symbols.',
    prompt: 'Summarize this dream description with key events, emotional themes, symbols present, and potential interpretations or meanings.'
  },
  {
    id: 'startup-pitch',
    name: 'Startup Pitch Practice',
    category: '🎨 Creative & Personal',
    description: 'Give feedback on clarity, persuasiveness, and tone.',
    prompt: 'Provide feedback on pitch clarity, persuasiveness, tone, structure, and delivery. Highlight strengths and areas for improvement in the presentation.'
  },
  {
    id: 'elevator-pitch',
    name: 'Create My Elevator Pitch',
    category: '🎨 Creative & Personal',
    description: 'Generate a concise, engaging elevator pitch from this startup description.',
    prompt: 'You\'re a startup coach. Listen to this voice memo describing my startup idea. Create a compelling 30-second elevator pitch suitable for investors or networking events. Focus on clarity, value proposition, and emotional hook.'
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing Dump',
    category: '🎨 Creative & Personal',
    description: 'Organize storylines, characters, and scene ideas.',
    prompt: 'Organize storylines, character ideas, scene concepts, plot elements, and creative writing ideas mentioned in this creative session.'
  },

  // Productivity & Thinking
  {
    id: 'todo-list',
    name: 'Voice To-Do List',
    category: '🧠 Productivity & Thinking',
    description: 'Convert notes into structured, prioritized tasks.',
    prompt: 'Convert these voice notes into a structured, prioritized task list with clear action items, deadlines mentioned, and priority levels.'
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming Session',
    category: '🧠 Productivity & Thinking',
    description: 'Group ideas and generate actionable follow-ups.',
    prompt: 'Group related ideas together, identify the most promising concepts, and generate actionable follow-up steps from this brainstorming session.'
  },
  {
    id: 'mind-mapping',
    name: 'Mind Mapping Session',
    category: '🧠 Productivity & Thinking',
    description: 'Extract and structure connected thoughts or concepts.',
    prompt: 'Extract and structure connected thoughts, concepts, and ideas. Show relationships between different topics and organize into a logical hierarchy.'
  },

  // Neurodivergent Productivity Tools (ADHD Focus)
  {
    id: 'sort-tasks',
    name: 'Sort My Tasks',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Turns a chaotic voice dump into a clear, prioritized to-do list with time estimates.',
    prompt: 'Transform this chaotic voice dump into a clear, prioritized to-do list. Organize tasks by urgency and importance, provide realistic time estimates for each task, and group related items together. Format as an actionable task list perfect for ADHD brains.'
  },
  {
    id: 'next-action',
    name: 'What Should I Do Next?',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Analyzes your voice note and suggests the top 1–3 realistic next steps based on your context.',
    prompt: 'Analyze this voice note and identify the top 1-3 realistic next steps I should take. Consider my current context, energy level, and any constraints mentioned. Provide specific, actionable steps that are appropriate for someone with ADHD.'
  },
  {
    id: 'structure-thoughts',
    name: 'Structure My Thoughts',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Takes a nonlinear ramble and converts it into categories, bullet points, or mind map format.',
    prompt: 'Take this nonlinear stream of consciousness and organize it into clear categories, bullet points, or mind map format. Extract the key themes and present them in a structured way that makes sense for an ADHD brain.'
  },
  {
    id: 'hyperfocus-tracker',
    name: 'What Was I Talking About?',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Recaps the last few minutes of thinking to help users who drift mid-task refocus or reconnect with their original intent.',
    prompt: 'Provide a clear recap of the main topics and thoughts discussed in this recording. Help me reconnect with my original intent and identify where my attention may have drifted. Summarize the key points to help me refocus.'
  },
  {
    id: 'mood-mindset',
    name: 'Mood & Mindset Summary',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Summarizes your current emotional state, identifies possible triggers, and suggests calming/self-care actions.',
    prompt: 'Analyze this voice recording to summarize my current emotional state and mindset. Identify any possible triggers or stressors mentioned, and suggest specific calming or self-care actions that would be helpful right now.'
  },
  {
    id: 'procrastination-decoder',
    name: 'Why Am I Stuck?',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Analyzes voice logs where the user talks about being stuck or blocked and highlights possible causes and paths forward.',
    prompt: 'Analyze why I\'m feeling stuck or blocked based on what I\'ve shared. Identify the underlying causes of my procrastination or mental block, and suggest specific, ADHD-friendly strategies to move forward.'
  },
  {
    id: 'shower-thoughts',
    name: 'Capture My Random Ideas',
    category: '🌀 Neurodivergent Productivity Tools (ADHD Focus)',
    description: 'Extracts disconnected thoughts and puts them into a "save-for-later" idea vault.',
    prompt: 'Extract all the random ideas, thoughts, and insights from this recording and organize them into a "save-for-later" idea vault. Categorize disconnected thoughts and preserve them for future exploration without losing the creative spark.'
  }
];

const PromptProcessor = ({ transcript, onResults, userId, inputLanguage, outputLanguage }: PromptProcessorProps) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processWithPrompt = async (promptText: string) => {
    if (!promptText.trim()) {
      toast.error('Please select a prompt or enter a custom prompt');
      return;
    }

    setIsProcessing(true);
    
    try {
      const contextualPrompt = customContext.trim() 
        ? `${promptText}\n\nAdditional context: ${customContext}`
        : promptText;

      console.log('Sending request to process-custom-prompt:', {
        transcript: transcript.substring(0, 100) + '...',
        prompt: contextualPrompt.substring(0, 100) + '...',
        userId,
        inputLanguage,
        outputLanguage
      });

      const { data, error } = await supabase.functions.invoke('process-custom-prompt', {
        body: {
          transcript,
          prompt: contextualPrompt,
          userId,
          inputLanguage: inputLanguage || 'en',
          outputLanguage: outputLanguage || inputLanguage || 'en'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process prompt');
      }

      console.log('Function response:', data);

      onResults({
        summary: data.summary || data.content || 'No summary generated',
        actionItems: data.actionItems || []
      });
      
      toast.success('Custom prompt processed successfully!');
    } catch (error) {
      console.error('Error processing custom prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process prompt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePredefinedPrompt = (prompt: string) => {
    processWithPrompt(prompt);
  };

  const handleCustomPrompt = () => {
    processWithPrompt(customPrompt);
  };

  // Group prompts by category
  const groupedPrompts = predefinedPrompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, typeof predefinedPrompts>);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Custom Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Predefined Prompts</label>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedPrompts).map(([category, prompts]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="text-left">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {prompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{prompt.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{prompt.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePredefinedPrompt(prompt.prompt)}
                          disabled={isProcessing}
                          className="ml-3 whitespace-nowrap"
                        >
                          {isProcessing && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Generate
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="border-t pt-6">
          <label className="text-sm font-medium mb-2 block">✏️ Custom Prompt</label>
          <p className="text-xs text-gray-600 mb-3">Write your own instruction and optionally add context.</p>
          <Textarea
            placeholder="Enter your custom prompt for analyzing the transcript..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[80px] mb-2"
          />
          <Textarea
            placeholder="Add any additional context or specific requirements (optional)..."
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            className="min-h-[60px] mb-2"
          />
          <Button 
            onClick={handleCustomPrompt}
            disabled={!customPrompt.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Process Custom Prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptProcessor;
