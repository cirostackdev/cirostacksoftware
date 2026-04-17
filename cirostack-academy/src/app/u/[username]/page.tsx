import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, ExternalLink, Github, Award, Code2, Zap, Flame } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import LevelBadge from '@/components/ui/LevelBadge';
import Button from '@/components/ui/Button';
import { xpToLevel } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface PublicProfile {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  countryCode: string;
  xpTotal: number;
  streakCurrent: number;
  createdAt: string;
  certificates?: { id: string; issuedAt: string; verificationCode: string; course?: { title: string; level: string; slug?: string } }[];
  publicProjects?: { id: string; title: string; description: string; liveUrl: string; githubUrl: string | null; techStack: string[]; instructorScore: number | null; course?: { title: string } }[];
  badges?: { id: string; name: string; imageUrl: string; description: string }[];
}

async function getProfile(username: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_URL}/users/${username}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} — CiroStack Academy` };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) notFound();

  const level = xpToLevel(profile.xpTotal);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <Avatar src={profile.avatarUrl} name={profile.fullName} size="xl" />
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-1">
              {profile.fullName}
            </h1>
            <p className="text-[var(--color-text-muted)] mb-3">@{profile.username}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <Zap className="h-4 w-4 text-[#E82121]" />
                <span>Level {level}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <Flame className="h-4 w-4 text-[#F59E0B]" />
                <span>{profile.streakCurrent} day streak</span>
              </div>
              {profile.certificates?.length !== undefined && (
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <Award className="h-4 w-4 text-[#7C3AED]" />
                  <span>{profile.certificates.length} courses completed</span>
                </div>
              )}
              {profile.countryCode && (
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{profile.countryCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Projects */}
            {profile.publicProjects && profile.publicProjects.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-[#E82121]" />
                  Shipped projects
                </h2>
                <div className="space-y-4">
                  {profile.publicProjects.map((p) => (
                    <div key={p.id} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-display font-semibold text-[var(--color-text)]">{p.title}</h3>
                          {p.course?.title && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{p.course.title}</p>
                          )}
                        </div>
                        {p.instructorScore !== null && (
                          <div className="text-center shrink-0">
                            <p className="font-display font-bold text-[#E82121]">{p.instructorScore}</p>
                            <p className="text-[9px] text-[var(--color-text-muted)]">Score</p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mb-3">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.techStack.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                      <div className="flex gap-3">
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>Live demo</Button>
                        </a>
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" leftIcon={<Github className="h-3.5 w-3.5" />}>GitHub</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {profile.certificates && profile.certificates.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#7C3AED]" />
                  Certificates
                </h2>
                <div className="space-y-3">
                  {profile.certificates.map((c) => (
                    <div key={c.id} className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5 text-[#7C3AED]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--color-text)] text-sm">{c.course?.title ?? 'Course'}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(c.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      {c.course?.level && (
                        <LevelBadge level={c.course.level as any} />
                      )}
                      <a href={`/certificates/verify/${c.verificationCode}`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: XP + badges */}
          <div className="space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h3 className="font-display font-semibold text-[var(--color-text)] mb-4">XP</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#E82121] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{level}</span>
                </div>
                <div>
                  <p className="font-display font-bold text-[var(--color-text)]">Level {level}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{profile.xpTotal.toLocaleString()} total XP</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[#E82121]"
                  style={{ width: `${((profile.xpTotal % 500) / 500) * 100}%` }}
                />
              </div>
            </div>

            {profile.badges && profile.badges.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                <h3 className="font-display font-semibold text-[var(--color-text)] mb-4">Badges</h3>
                <div className="grid grid-cols-3 gap-3">
                  {profile.badges.map((b) => (
                    <div key={b.id} className="text-center" title={b.description}>
                      <div className="text-3xl mb-1">{b.imageUrl}</div>
                      <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">{b.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
