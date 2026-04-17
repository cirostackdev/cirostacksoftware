'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Github, Code2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api/client';
import type { CapstoneProject } from '@/types';

const statusConfig = {
  pending: { label: 'Under review', variant: 'warning' as const },
  approved: { label: 'Approved', variant: 'success' as const },
  revision_requested: { label: 'Revisions needed', variant: 'warning' as const },
  rejected: { label: 'Rejected', variant: 'danger' as const },
};

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<CapstoneProject[]>('/capstone')
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="h-16 w-16 rounded-full bg-[#E82121]/10 flex items-center justify-center mx-auto mb-5">
          <Code2 className="h-8 w-8 text-[#E82121]" />
        </div>
        <h3 className="font-display text-xl font-semibold text-[var(--color-text)] mb-2">No projects yet</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-xs mx-auto">
          Complete a course with a Ship It capstone to submit your first project.
        </p>
        <Button variant="outline" asChild><Link href="/courses">Find a course</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      {projects.map((project) => {
        const { label, variant } = statusConfig[project.status];
        return (
          <div key={project.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={variant}>{label}</Badge>
                  {project.isTalentPipelineFlagged && (
                    <Badge variant="gold">⭐ Talent Pipeline</Badge>
                  )}
                </div>
                <h3 className="font-display font-semibold text-[var(--color-text)]">{project.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{project.description}</p>
              </div>
              {project.instructorScore !== null && (
                <div className="text-center shrink-0">
                  <p className="font-display text-2xl font-bold text-[#E82121]">{project.instructorScore}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Score</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {project.techStack.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>

            {project.instructorFeedback && (
              <div className="p-3 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 text-sm text-[var(--color-text-muted)]">
                <span className="font-medium text-[#10B981]">Instructor feedback: </span>
                {project.instructorFeedback}
              </div>
            )}

            <div className="flex gap-3">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>Live demo</Button>
              </a>
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" leftIcon={<Github className="h-3.5 w-3.5" />}>GitHub</Button>
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
