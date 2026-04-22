'use client';

import { useState, useEffect } from 'react';
import { Flag, ExternalLink, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPost } from '@/lib/api/client';
import type { TalentPipelineEntry, CapstoneProject } from '@/types';

interface TalentEntry extends TalentPipelineEntry {
  user: { fullName: string; email: string; username: string; avatarUrl: string | null };
  capstoneProject: CapstoneProject;
}

const statusConfig = {
  flagged: { label: 'Flagged', variant: 'warning' as const },
  referred: { label: 'Referred to Orion', variant: 'blue' as const },
  engaged: { label: 'Engaged', variant: 'purple' as const },
  hired: { label: 'Hired', variant: 'success' as const },
};

export default function TalentPipelinePage() {
  const [entries, setEntries] = useState<TalentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiGet<TalentEntry[]>('/admin/talent-pipeline')
      .then(setEntries)
      .catch(() => toast.error('Failed to load talent pipeline.'))
      .finally(() => setIsLoading(false));
  }, []);

  const referToOrion = async (id: string) => {
    try {
      const updated = await apiPost<TalentEntry>(`/admin/talent-pipeline/${id}/refer`, {});
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...updated } : e));
      toast.success('Armory event fired → Orion will create a project match story.');
    } catch {
      toast.error('Failed to refer to Orion.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-[var(--color-text-muted)] text-sm">
          {isLoading ? '—' : `${entries.length} graduates flagged by instructors for the CiroStack talent pipeline.`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {entries.length === 0 && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-12">No talent pipeline entries yet.</p>
          )}
          {entries.map((e) => {
            const { label, variant } = statusConfig[e.status];
            const project = e.capstoneProject;
            return (
              <div key={e.id} className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar src={e.user.avatarUrl} name={e.user.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-display font-semibold text-[var(--color-text)]">{e.user.fullName}</p>
                      <Badge variant={variant} className="text-[10px]">
                        <Flag className="h-2.5 w-2.5" /> {label}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {project?.course?.title} · Score: <span className="font-bold text-[#E53935]">{project?.instructorScore ?? '—'}/100</span>
                    </p>
                    <p className="text-sm font-medium text-[var(--color-text)] mt-1">{project?.title}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {e.skillTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>

                {e.notes && (
                  <p className="text-sm text-[var(--color-text-muted)] italic mb-4">&ldquo;{e.notes}&rdquo;</p>
                )}

                {e.referredToOrionAt && (
                  <p className="text-xs text-[var(--color-text-subtle)] mb-3 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-[#10B981]" />
                    Referred to Orion on {new Date(e.referredToOrionAt).toLocaleDateString()}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  {project?.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                        View project
                      </Button>
                    </a>
                  )}
                  {e.status === 'flagged' && (
                    <Button
                      size="sm"
                      leftIcon={<Send className="h-3.5 w-3.5" />}
                      onClick={() => referToOrion(e.id)}
                      variant="ai"
                    >
                      Refer to Orion
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
