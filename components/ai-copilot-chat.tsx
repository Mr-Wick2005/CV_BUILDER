'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  Check,
  Wand2,
  Target,
  ArrowRight,
  RotateCcw,
  FileText,
  BadgeAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getUserApiKey } from '@/lib/storage';
import type { ResumeData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  patch?: Partial<ResumeData>;
  actionType?: string;
  applied?: boolean;
  suggestedFollowUps?: string[];
}

interface AICopilotChatProps {
  resume: ResumeData;
  onResumeChange: (updated: ResumeData) => void;
  targetRole: string;
  setTargetRole: (r: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
}

const QUICK_ACTIONS = [
  {
    label: 'Tailor to JD',
    icon: Target,
    prompt: 'Tailor my resume for this job description. Optimize my summary, prioritize matching skills, and strengthen project bullet points.',
  },
  {
    label: 'STAR Bullets',
    icon: Wand2,
    prompt: 'Rewrite my project and experience bullets using the STAR method (Situation, Task, Action, Result) with strong action verbs and quantified impact.',
  },
  {
    label: 'Executive Summary',
    icon: Sparkles,
    prompt: 'Craft a punchy, 2-3 sentence executive summary tailored for a high-impact recruiter scan for my target role.',
  },
  {
    label: 'ATS Keywords Match',
    icon: Cpu,
    prompt: 'Analyze keyword match between my resume and the job description. Which high-priority technologies should I highlight?',
  },
  {
    label: 'Fit to 1 Page',
    icon: Layers,
    prompt: 'How can we tighten and balance the content density of this resume so it fits cleanly on exactly one A4 page with zero trailing void?',
  },
];

export function AICopilotChat({
  resume,
  onResumeChange,
  targetRole,
  setTargetRole,
  jobDescription,
  setJobDescription,
}: AICopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello **${resume.contact.name || 'there'}**! I'm your **AI Career Copilot**.\n\nI have loaded your live resume canvas (${resume.projects?.length || 0} projects, ${resume.skills?.length || 0} skill categories).\n\nPaste your target job description or choose a quick action below, and I will tailor your resume and update your canvas in real-time!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Tailor resume for my target role',
        'Strengthen bullets with STAR method',
        'Analyze ATS keyword match',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJdPanel, setShowJdPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Apply a patch directly to the live ResumeData canvas
  const handleApplyPatch = (msgId: string, patch: Partial<ResumeData>) => {
    const updated: ResumeData = {
      ...resume,
      ...patch,
      isDirty: true,
      previewMode: 'editable',
    };
    onResumeChange(updated);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
    toast({
      title: 'Canvas Updated Live!',
      description: 'AI changes applied directly to your resume document.',
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          resume,
          targetRole,
          jobDescription,
          userApiKey,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'I have analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patch: data.patch,
        actionType: data.actionType,
        applied: false,
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      // Auto-apply patch if it was an explicit tailor or update request
      if (data.patch && Object.keys(data.patch).length > 0) {
        const autoApply = true;
        if (autoApply) {
          const updated: ResumeData = {
            ...resume,
            ...data.patch,
            isDirty: true,
            previewMode: 'editable',
          };
          onResumeChange(updated);
          assistantMsg.applied = true;
          toast({
            title: 'Canvas Updated Live!',
            description: 'AI changes reflected on your resume canvas in real time.',
          });
        }
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          "I experienced a temporary network issue contacting the AI model. Let's make sure you've selected your target role or pasted the job description above.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card/20">
      {/* Target Role & JD Quick Collapsible Header */}
      <div className="border-b border-border bg-card/60 p-3 backdrop-blur space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Target className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Role:</span>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Engineer"
              className="text-xs bg-transparent border-b border-dashed border-border/80 focus:border-primary focus:outline-none px-1 py-0.5 truncate flex-1 font-medium text-foreground"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJdPanel((prev) => !prev)}
            className="h-7 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-3 w-3 text-primary" />
            <span>{jobDescription.trim() ? 'JD Loaded' : 'Paste JD'}</span>
            {showJdPanel ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {/* Collapsible JD Box */}
        {showJdPanel && (
          <div className="space-y-1.5 pt-1 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Target Job Description:</span>
              {jobDescription && (
                <button
                  onClick={() => setJobDescription('')}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Clear JD
                </button>
              )}
            </div>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here to optimize ATS score and match keywords..."
              className="min-h-[85px] text-xs font-mono leading-relaxed resize-y bg-background/80"
            />
          </div>
        )}
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-2.5 border-b border-border/70 bg-card/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => handleSendMessage(action.prompt)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground hover:bg-primary/5 active:scale-95 disabled:opacity-50"
            >
              <Icon className="h-3 w-3 text-primary" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto app-scroll p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Bubble Container */}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border border-border/80 text-foreground rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>

                {/* Patch Action Notification Card */}
                {msg.patch && Object.keys(msg.patch).length > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-foreground space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Live Canvas Patch Generated</span>
                      </div>
                      {msg.applied ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] gap-1 h-5"
                        >
                          <Check className="h-2.5 w-2.5" /> Applied to Canvas
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => msg.patch && handleApplyPatch(msg.id, msg.patch)}
                          className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                        >
                          <Check className="h-3 w-3" /> Apply to Canvas
                        </Button>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {msg.patch.summary && '• Updated Professional Summary '}
                      {msg.patch.skills && '• Re-ranked Technical Skills '}
                      {msg.patch.projects && '• Enhanced STAR Project Bullets '}
                      {msg.patch.positions && '• Optimized Leadership Positions '}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Up Prompt Chips */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        disabled={loading}
                        className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5 transition-all text-left"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] text-muted-foreground/60 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground border border-border mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-2.5 items-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 mt-0.5 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-card border border-border/80 px-3.5 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Analyzing resume & crafting optimal canvas updates...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="border-t border-border bg-card/80 p-3 backdrop-blur space-y-2">
        <div className="relative flex items-end rounded-xl border border-border/80 bg-background focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/20 transition-all p-1.5 shadow-sm">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot (e.g., 'Tailor for Stripe Full Stack role', 'Quantify my portfolio bullets')..."
            rows={2}
            className="min-h-[46px] max-h-[140px] resize-none border-0 bg-transparent text-xs p-1.5 focus-visible:ring-0 leading-relaxed"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 transition-all mb-0.5"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  role: 'assistant',
                  content: 'Chat history cleared. How can I assist with your resume today?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="hover:underline flex items-center gap-1 text-muted-foreground/70 hover:text-foreground"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}
