'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/course/CourseCard';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { apiGet } from '@/lib/api/client';
import type { Course, CourseCategory, CourseLevel } from '@/types';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/config/nav';

const levels: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];
const categories = Object.keys(CATEGORY_LABELS) as CourseCategory[];

function CatalogContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CourseCategory | null>(
    (searchParams.get('category') as CourseCategory) || null
  );
  const [activeLevel, setActiveLevel] = useState<CourseLevel | null>(null);
  const [isFreeOnly, setIsFreeOnly] = useState(searchParams.get('is_free') === 'true');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (activeCategory) params.set('category', activeCategory);
    if (activeLevel) params.set('level', activeLevel);
    if (isFreeOnly) params.set('is_free', 'true');
    apiGet<Course[]>(`/courses?${params}`)
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false));
  }, [activeCategory, activeLevel, isFreeOnly]);

  const filtered = useMemo(() =>
    courses.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [courses, search]
  );

  const hasFilters = !!(activeCategory || activeLevel || isFreeOnly || search);

  const clearAll = () => {
    setSearch('');
    setActiveCategory(null);
    setActiveLevel(null);
    setIsFreeOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-2">Course catalog</h1>
        <p className="text-[var(--color-text-muted)]">
          {isLoading ? 'Loading courses...' : `${courses.length} courses across 7 categories`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className={cn(
          'lg:w-56 shrink-0',
          isFilterOpen ? 'block' : 'hidden lg:block'
        )}>
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      activeCategory === cat
                        ? 'bg-[#E82121]/10 text-[#E82121] font-medium'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                    )}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Level</h3>
              <div className="space-y-1">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(activeLevel === lvl ? null : lvl)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors',
                      activeLevel === lvl
                        ? 'bg-[#E82121]/10 text-[#E82121] font-medium'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                    )}
                  >
                    {LEVEL_LABELS[lvl]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Price</h3>
              <button
                onClick={() => setIsFreeOnly(!isFreeOnly)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  isFreeOnly
                    ? 'bg-[#E82121]/10 text-[#E82121] font-medium'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                )}
              >
                Free courses only
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search + mobile filter toggle */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <input
                type="search"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#E82121] focus:border-[#E82121] placeholder:text-[var(--color-text-subtle)]"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden"
            >
              Filters
            </Button>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-[var(--color-text-muted)]">Filters:</span>
              {activeCategory && (
                <Badge variant="blue" className="gap-1 cursor-pointer" onClick={() => setActiveCategory(null)}>
                  {CATEGORY_LABELS[activeCategory]} <X className="h-3 w-3" />
                </Badge>
              )}
              {activeLevel && (
                <Badge variant="blue" className="gap-1 cursor-pointer" onClick={() => setActiveLevel(null)}>
                  {LEVEL_LABELS[activeLevel]} <X className="h-3 w-3" />
                </Badge>
              )}
              {isFreeOnly && (
                <Badge variant="success" className="gap-1 cursor-pointer" onClick={() => setIsFreeOnly(false)}>
                  Free only <X className="h-3 w-3" />
                </Badge>
              )}
              <button onClick={clearAll} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline">
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Showing {filtered.length} of {courses.length} courses
              </p>

              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 text-[var(--color-border-2)] mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold text-[var(--color-text)] mb-2">No courses found</h3>
                  <p className="text-[var(--color-text-muted)]">Try different filters or search terms.</p>
                  <Button variant="outline" size="sm" onClick={clearAll} className="mt-4">Clear filters</Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseCatalogPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      }>
        <CatalogContent />
      </Suspense>
      <Footer />
    </div>
  );
}
