'use client';

import { useState, useEffect } from 'react';
import { Search, Copy, Trash2, Library, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiDelete } from '@/lib/api/client';
import type { UserPromptLibraryItem, PromptTag } from '@/types';

const tagColors: Record<PromptTag, string> = {
  architecture: 'blue', debugging: 'danger', refactor: 'purple',
  generation: 'success', review: 'warning', explanation: 'info', testing: 'default',
};

export default function PromptLibraryPage() {
  const [search, setSearch] = useState('');
  const [prompts, setPrompts] = useState<UserPromptLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<UserPromptLibraryItem[]>('/prompt-library')
      .then(setPrompts)
      .catch(() => setPrompts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = prompts.filter((p) =>
    !search ||
    p.promptText.toLowerCase().includes(search.toLowerCase()) ||
    p.customLabel?.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Prompt copied to clipboard!');
  };

  const deletePrompt = async (id: string) => {
    try {
      await apiDelete(`/prompt-library/${id}`);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      toast.info('Prompt removed.');
    } catch {
      toast.error('Failed to delete prompt.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            placeholder="Search your prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#E82121]"
          />
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">
        {filtered.length} prompt{filtered.length !== 1 ? 's' : ''} · Saved from Steal the Prompt + your own
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          <Library className="h-10 w-10 text-[var(--color-border-2)] mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-[var(--color-text)] mb-2">
            Your library is empty
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Save prompts from course lessons using the &ldquo;Steal the Prompt&rdquo; panel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.customLabel && (
                    <span className="text-sm font-semibold text-[var(--color-text)]">{p.customLabel}</span>
                  )}
                  {p.tag && (
                    <Badge variant={tagColors[p.tag] as any} className="text-[10px]">
                      <Tag className="h-2.5 w-2.5" />
                      {p.tag}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">{p.modelUsed}</Badge>
                  {p.isCustom && <Badge variant="gold" className="text-[10px]">Custom</Badge>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(p.promptText)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deletePrompt(p.id)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <pre className="text-xs text-[var(--color-text-muted)] font-mono bg-[var(--color-surface-2)] rounded-lg p-3 whitespace-pre-wrap leading-relaxed border border-[var(--color-border)]">
                {p.promptText}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
