'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, ShieldCheck, Trash2, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { getUserApiKey, setUserApiKey } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetAllData: () => void;
}

export function SettingsModal({ open, onOpenChange, onResetAllData }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const existing = getUserApiKey();
      setApiKey(existing);
      setSavedKey(Boolean(existing));
    }
  }, [open]);

  const handleSaveKey = () => {
    setUserApiKey(apiKey);
    setSavedKey(Boolean(apiKey.trim()));
    toast({
      title: apiKey.trim() ? 'API Key Saved' : 'Custom API Key Cleared',
      description: apiKey.trim()
        ? 'Your custom Gemini key will be used for high-speed AI tailoring.'
        : 'The app will now use default shared API or smart local tailoring.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-primary" />
            AI & Platform Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI tailoring engine and manage your local data sandbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Bring Your Own Key */}
          <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Google Gemini API Key</Label>
              {savedKey ? (
                <Badge variant="default" className="gap-1 text-[10px] bg-green-600">
                  <CheckCircle2 className="h-3 w-3" /> Custom Key Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Default / Local Engine
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Optional: Provide your free Google Gemini API key for dedicated unlimited high-speed AI optimizations.
            </p>

            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-xs font-mono"
              />
              <Button onClick={handleSaveKey} size="sm">
                Save
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Get Free Gemini API Key <ExternalLink className="h-3 w-3" />
              </a>
              {apiKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setApiKey('');
                    setUserApiKey('');
                    setSavedKey(false);
                  }}
                  className="h-6 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear key
                </Button>
              )}
            </div>
          </div>

          {/* Privacy & Sandbox */}
          <div className="space-y-2 rounded-lg border border-border p-4 bg-card/50">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Zero-Data Retention Architecture
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your resume data is stored strictly in your browser’s LocalStorage sandbox. We do not store personal student contact information on any central server.
            </p>
          </div>

          {/* Reset Workspace */}
          <div className="space-y-2 pt-1 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground">Workspace Management</Label>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Reset all saved resumes to factory defaults:</div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all stored resumes to default templates?')) {
                    onResetAllData();
                    onOpenChange(false);
                  }
                }}
                className="gap-1.5 h-8 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reset Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
