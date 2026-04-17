'use client';

import { CheckCircle, Zap, ArrowRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Props {
  xpEarned: number;
  nextLessonTitle?: string;
  onClose: () => void;
  onNext: () => void;
}

export default function LessonCompleteModal({ xpEarned, nextLessonTitle, onClose, onNext }: Props) {
  return (
    <Modal isOpen onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className="h-16 w-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-[#10B981]" />
        </div>

        <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-1">
          Lesson complete! 🎉
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Great work. Keep the momentum going.
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 mb-6">
          <Zap className="h-5 w-5 text-[#7C3AED]" />
          <span className="font-display font-bold text-[#7C3AED] text-lg">+{xpEarned} XP</span>
        </div>

        <div className="flex flex-col gap-3">
          {nextLessonTitle && (
            <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onNext}>
              Next: {nextLessonTitle}
            </Button>
          )}
          <Button variant="ghost" fullWidth onClick={onClose}>
            Stay on this lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
}
