'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Github, CheckCircle, XCircle, AlertCircle, Flag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { cn } from '@/lib/utils';
import { apiGet, apiPatch } from '@/lib/api/client';
import type { CapstoneProject } from '@/types';

type Submission = CapstoneProject & {
  user?: { fullName: string };
  course?: { title: string };
};
type ReviewAction = 'approve' | 'request_revision' | 'reject';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [flagForPipeline, setFlagForPipeline] = useState(false);

  useEffect(() => {
    apiGet<Submission[]>('/capstone/instructor/capstone')
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setIsLoading(false));
  }, []);

  const reviewSubmission = (submission: Submission) => {
    setReviewingId(submission.id);
    setScore('');
    setFeedback('');
    setFlagForPipeline(false);
  };

  const submitReview = async (action: ReviewAction) => {
    const statusMap: Record<ReviewAction, CapstoneProject['status']> = {
      approve: 'approved',
      request_revision: 'revision_requested',
      reject: 'rejected',
    };
    try {
      const updated = await apiPatch<CapstoneProject>(`/capstone/instructor/capstone/${reviewingId}/review`, {
        score: score ? Number(score) : 0,
        status: statusMap[action],
        feedback,
        isTalentPipelineFlagged: flagForPipeline,
      });
      setSubmissions((prev) => prev.map((s) => s.id === reviewingId ? { ...s, ...updated } : s));
      setReviewingId(null);
      toast.success(`Project ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent back for revision'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const pending = submissions.filter((s) => s.status === 'pending');
  const reviewed = submissions.filter((s) => s.status !== 'pending');
  const reviewing = submissions.find((s) => s.id === reviewingId);

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-[var(--color-text-muted)]">
          {pending.length} pending review{pending.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-display text-base font-semibold text-[var(--color-text)] mb-3">
            Awaiting review
          </h2>
          <div className="space-y-3">
            {pending.map((s) => (
              <div key={s.id} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-display font-semibold text-[var(--color-text)]">{s.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      by {s.user?.fullName ?? 'Unknown'} · {s.course?.title ?? ''}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">{s.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {s.techStack.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                </div>
                <div className="flex items-center gap-3">
                  <a href={s.liveUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>Live demo</Button>
                  </a>
                  {s.githubUrl && (
                    <a href={s.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" leftIcon={<Github className="h-3.5 w-3.5" />}>GitHub</Button>
                    </a>
                  )}
                  <Button size="sm" onClick={() => reviewSubmission(s)} className="ml-auto">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="font-display text-base font-semibold text-[var(--color-text)] mb-3">Reviewed</h2>
          <div className="space-y-2">
            {reviewed.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                {s.status === 'approved' ? <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0" /> : s.status === 'rejected' ? <XCircle className="h-5 w-5 text-[#EF4444] shrink-0" /> : <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{s.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">by {s.user?.fullName ?? 'Unknown'}</p>
                </div>
                {s.instructorScore && <span className="font-display font-bold text-[#E53935]">{s.instructorScore}/100</span>}
                {s.isTalentPipelineFlagged && <Badge variant="gold"><Flag className="h-3 w-3" />Pipeline</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review modal */}
      <Modal isOpen={!!reviewingId} onClose={() => setReviewingId(null)} title={`Review: ${reviewing?.title}`} size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">Score (0–100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="85"
              className="w-full h-10 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-sm px-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#E53935]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Provide constructive feedback..."
              className="w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-sm p-3 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E53935] resize-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--color-border)] hover:border-[#F59E0B]/50 transition-colors">
            <input type="checkbox" checked={flagForPipeline} onChange={(e) => setFlagForPipeline(e.target.checked)} className="h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Flag for Talent Pipeline</p>
              <p className="text-xs text-[var(--color-text-muted)]">Nominate this student for CiroStack&apos;s client project matching</p>
            </div>
          </label>
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => submitReview('reject')}>Reject</Button>
            <Button variant="outline" size="sm" leftIcon={<AlertCircle className="h-4 w-4" />} onClick={() => submitReview('request_revision')}>Request revision</Button>
            <Button size="sm" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => submitReview('approve')} className="ml-auto">Approve</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
