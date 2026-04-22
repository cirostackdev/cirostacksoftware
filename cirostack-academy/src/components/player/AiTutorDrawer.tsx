'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useAiTutorStore } from '@/lib/store/useAiTutorStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { AiModel } from '@/types';

const models: AiModel[] = ['claude', 'gpt4', 'gemini'];

interface Props {
  lessonId: string;
  onClose: () => void;
}

export default function AiTutorDrawer({ lessonId, onClose }: Props) {
  const { conversations, isLoading, activeModel, setActiveModel, sendMessage, clearConversation } = useAiTutorStore();
  const messages = conversations[lessonId] || [];
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(lessonId, msg);
  };

  return (
    <aside className="w-80 border-l border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col animate-slide-in-right shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <div>
          <p className="font-display font-semibold text-sm text-[var(--color-text)]">Cipher AI Tutor</p>
          <p className="text-xs text-[var(--color-text-muted)]">Context-aware for this lesson</p>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Model selector */}
      <div className="flex gap-1 p-3 border-b border-[var(--color-border)]">
        {models.map((m) => (
          <button
            key={m}
            onClick={() => setActiveModel(m)}
            className={cn(
              'flex-1 py-1 text-xs rounded-lg font-medium transition-colors',
              activeModel === m
                ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mb-1">Ask Cipher anything</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              I know what lesson you&apos;re on and can give context-aware answers.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-[#7C3AED]/10 flex items-center justify-center shrink-0 text-sm">
                ⚡
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-[#E53935] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[#7C3AED]/10 flex items-center justify-center shrink-0 text-sm">⚡</div>
            <div className="bg-[var(--color-surface-2)] rounded-xl px-3 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-[#7C3AED]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about this lesson..."
            rows={2}
            className="flex-1 rounded-xl border border-[var(--color-border-2)] bg-[var(--color-bg)] text-sm p-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
