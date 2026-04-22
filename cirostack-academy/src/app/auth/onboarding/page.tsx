'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { apiPost } from '@/lib/api/client';
import { toast } from '@/lib/store/useToastStore';
import type { OnboardingAnswer, CourseCategory } from '@/types';
import { CATEGORY_LABELS } from '@/config/nav';

type Step = 1 | 2 | 3;

const skillLevels = [
  { value: 'complete_beginner', label: 'Complete beginner', emoji: '🌱', desc: 'I\'m new to coding' },
  { value: 'some_experience', label: 'Some experience', emoji: '💡', desc: 'I know the basics' },
  { value: 'professional', label: 'Professional', emoji: '🚀', desc: 'I work in tech' },
] as const;

const learningGoals = [
  { value: 'get_hired', label: 'Get hired', emoji: '💼', desc: 'Land a dev job' },
  { value: 'freelance', label: 'Freelance', emoji: '💰', desc: 'Work for clients' },
  { value: 'side_project', label: 'Side project', emoji: '🏗️', desc: 'Build my own thing' },
  { value: 'upskill', label: 'Upskill', emoji: '📈', desc: 'Level up at work' },
] as const;

const topicOptions = Object.entries(CATEGORY_LABELS) as [CourseCategory, string][];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswer>>({
    topics: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleTopic = (topic: CourseCategory) => {
    const current = answers.topics || [];
    setAnswers({
      ...answers,
      topics: current.includes(topic)
        ? current.filter((t) => t !== topic)
        : [...current, topic],
    });
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await apiPost('/users/me/onboarding', { answers });
      toast.success('All set! Here are your personalised recommendations.');
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong saving your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Tell us about yourself"
      subtitle={`Step ${step} of 3`}
    >
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'flex-1 h-1 rounded-full transition-all',
              s <= step ? 'bg-[#E53935]' : 'bg-[var(--color-border)]'
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-4">What&apos;s your current skill level?</p>
          <div className="space-y-2 mb-8">
            {skillLevels.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers({ ...answers, skillLevel: opt.value })}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                  answers.skillLevel === opt.value
                    ? 'border-[#E53935] bg-[#E53935]/5 text-[var(--color-text)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-2)] text-[var(--color-text-muted)]'
                )}
              >
                <span className="text-xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs">{opt.desc}</p>
                </div>
                {answers.skillLevel === opt.value && (
                  <Check className="h-4 w-4 text-[#E53935] shrink-0" />
                )}
              </button>
            ))}
          </div>
          <Button fullWidth disabled={!answers.skillLevel} rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => setStep(2)}>
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-4">What&apos;s your main goal?</p>
          <div className="space-y-2 mb-8">
            {learningGoals.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers({ ...answers, learningGoal: opt.value })}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                  answers.learningGoal === opt.value
                    ? 'border-[#E53935] bg-[#E53935]/5 text-[var(--color-text)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-2)] text-[var(--color-text-muted)]'
                )}
              >
                <span className="text-xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs">{opt.desc}</p>
                </div>
                {answers.learningGoal === opt.value && (
                  <Check className="h-4 w-4 text-[#E53935] shrink-0" />
                )}
              </button>
            ))}
          </div>
          <Button fullWidth disabled={!answers.learningGoal} rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => setStep(3)}>
            Next
          </Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-4">What topics interest you? (pick any)</p>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {topicOptions.map(([value, label]) => {
              const isSelected = answers.topics?.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleTopic(value)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                    isSelected
                      ? 'border-[#E53935] bg-[#E53935]/5 text-[#E53935] font-medium'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-2)]'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Button
            fullWidth
            isLoading={isLoading}
            onClick={handleFinish}
          >
            Go to dashboard
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
