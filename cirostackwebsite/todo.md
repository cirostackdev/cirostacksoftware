# TODO — Outstanding Work

## Industry Content Rewrite (High Priority)
4 of 20 industry categories have been rewritten with unique, customer-facing content.  
16 categories remain with templated/keyword-injected content that needs rewriting.

### Completed
1. Retail & E-Commerce (10 pages)
2. Healthcare & Medical (10 pages)
3. Financial Services (10 pages)
4. Real Estate & Property (10 pages)

### Remaining (160 pages)
5. Education & E-Learning
6. Technology & Startups
7. Hospitality & Tourism
8. Manufacturing & Industrial
9. Media & Entertainment
10. Legal Services
11. Non-Profit & Social Enterprise
12. Agriculture & Farming
13. Transportation & Logistics
14. Sports & Recreation
15. Beauty & Personal Care
16. Small Business
17. Professional Services
18. Construction & Engineering
19. Government & Public Sector
20. Automotive

Each rewrite should:
- Address the customer (business owner/decision-maker), not a technical audience
- Map specific CiroStack services to concrete industry pain points
- Include realistic stats, challenges, solutions, FAQs, and client reviews
- Avoid generic placeholder language

## Blog Data Extraction (High Priority)
- Blog posts (`posts`, `postImages`, types) are hardcoded in `src/pages-src/BlogPost.tsx` (~950 lines). Extract to `src/data/blogPosts.ts`.
- `ServiceDetail.tsx` cross-imports blog data from `BlogPost.tsx` — this coupling should be broken.
- `src/app/blog/[id]/page.tsx` `generateMetadata` currently returns generic placeholders — update to use extracted blog data for real titles/descriptions.

## Three.js Dynamic Wrappers (High Priority)
- `HeroGlobe.tsx` and `ParticleNetwork.tsx` use `@react-three/fiber` Canvas + WebGL but are not wrapped in `dynamic(() => import(...), { ssr: false })`. If ever imported by a server component, the build will break. Create dynamic wrappers.

## Contact Form
- Currently a mock (toast notification → redirect to /thank-you). Needs real form submission (e.g., email service, Supabase, Formspree, or other third-party form handler).

## SEO
- **Sitemap**: `public/sitemap.xml` is a stale static file from the Vite build. Create `src/app/sitemap.ts` to auto-generate from route/data files, then delete the static version.
- **Robots**: `public/robots.txt` exists as static file. Consider creating `src/app/robots.ts` for dynamic generation.
- **Structured data (JSON-LD)**: Missing on service, industry, and FAQ pages.
- **Meta descriptions**: Industry pages need unique meta descriptions (currently may be generic).
- **metadataBase**: Hardcoded to `https://cirostack.lovable.app` in `src/app/layout.tsx:22`. Move to env var: `NEXT_PUBLIC_SITE_URL=https://www.cirostack.com`.
- **Twitter handle**: Layout metadata references `@Lovable` — should be CiroStack's own handle.

## Performance
- `industries-generated.ts` (~34K lines) is a massive single file. Consider code-splitting or lazy loading industry data by category.
- All 200 industry entries are bundled into the main JS payload regardless of which page is visited.

## Dark Mode
- `next-themes` is installed as a dependency but not wired up. CSS variables in `globals.css` only define light mode. Add dark mode variables and a theme toggle if dark mode is desired, or remove `next-themes` dependency.

## Search
- Navbar has a search icon. Radix Command component exists in `src/components/ui/command.tsx`. No functional search implemented — needs wiring up or icon removal.

## Analytics & Tracking
- No analytics integration (Google Analytics, Umami, etc.) visible in codebase.
- No cookie consent banner despite potential analytics needs.

## Version Control
- Project has no git repository. Initialize git for change tracking and deployment.

## Cleanup
- **Duplicate use-toast**: `src/hooks/use-toast.ts` and `src/components/ui/use-toast.ts` both exist — consolidate to one.
- **BlankPage.tsx**: Exists as a "Coming Soon" placeholder in `src/pages-src/`. Remove if no longer needed.
- **Newsroom content**: Contains fictional press releases with specific dollar amounts ("$2.5M seed round"). Verify these are intentional or replace with real content.
- **OG image**: Points to `storage.googleapis.com/gpt-engineer-file-uploads/...` — should use a self-hosted image.
- **Google verification**: `layout.tsx` has a Google site verification meta tag — verify it's still needed.
