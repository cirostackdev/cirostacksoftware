Good inputs. Here's what I'm building: a public-facing, paid learning platform targeting dev talents and the general public — think a lightweight Udemy/Scrimba but CiroStack-branded. Let me map the full spec.Now let me build the full platform spec and a visual concept for it.Here's the full platform spec followed by a visual concept mockup.

---

**Platform Name: CiroStack Academy**

The platform serves two audiences — aspiring/professional developers (from the Launchpad community) and the general public wanting to learn tech skills. It runs as a standalone product separate from the main CiroStack website, monetized through paid course purchases and monthly/annual subscriptions.

---

**User Roles**

Three roles govern the platform. Guests can browse the catalog and view free preview lessons. Students (paying users) get full access to purchased courses or all-access if on a subscription. Instructors (CiroStack team) can create, upload, and manage course content through a dedicated dashboard. Admins manage the whole system, users, billing, and analytics.

---

**Core Modules**

The platform has seven core modules. The Catalog is the public-facing course browsing experience with filters by category, level, and price. The Course Player is the learning environment where video, written content, and interactive exercises live side by side. The Code Sandbox runs inside the player using Monaco Editor connected to a Piston API backend for multi-language code execution. The Quiz Engine handles assessments with multiple choice, code challenges, and short answer types, and issues a score and course certificate on completion. The Billing module handles Paystack for Nigerian users and Stripe for international users, covering both one-time course purchases and recurring subscriptions. The Student Dashboard tracks enrolled courses, progress, certificates, and streaks. The Instructor Dashboard is the CMS where CiroStack's team structures courses into sections and lessons, uploads video, writes docs, and publishes quizzes.

---

**Course Categories**

UI/UX Design, Frontend Web Development, Backend Development, Mobile App Development (Flutter), AI & Machine Learning, Cloud & DevOps, Software Architecture, and Startup & Product Thinking, Ai asisted Coding, and more. These map directly to the Launchpad groups already set up in WhatsApp.

---

**Monetization Structure**

Individual courses are priced between ₦15,000–₦85,000 for Nigerian users and $15–$85 for international users depending on depth. Monthly subscriptions (all-access) are ₦9,500/month or $9/month. Annual subscriptions are ₦79,000/year or $75/year. A free tier exists with one or two preview lessons per course to drive conversion.

---

**Tech Stack (maps to existing CiroStack agents)**

Volt handles the React/Next.js frontend. Axon handles the Node.js/Express/Drizzle/Postgres API. Pulse handles a companion Flutter mobile app. Cipher handles the AI-powered features: a course recommendation engine and an AI tutor assistant inside the player. Forge handles cloud deployment. Nova handles Figma design for all screens. Armory routes all internal events (enrollment, payment confirmation, certificate generation).

---

**Integration Points**

Payment webhooks from Paystack/Stripe route through Armory to trigger enrollment events. Scroll (the newsletter agent) auto-publishes new course announcements to the blog and email list. Ciro (social media agent) gets notified on new course launches to create promotional content. The certificate generator fires when a student passes a course quiz above the threshold score (70%).

---

Now the visual concept:---

Here's how this maps to your agent roster for implementation:

**Nova** designs all screens in Figma — catalog, player, dashboard, quiz flow, certificate template.

**Ferro** produces the technical architecture spec — database schema (users, courses, lessons, enrollments, progress, payments), OpenAPI YAML for the course API, and TypeScript interfaces for the full data model.

**Axon** builds the backend — course CRUD, enrollment logic, progress tracking, quiz scoring, certificate generation, and Paystack/Stripe webhook handlers.

**Volt** builds the React/Next.js frontend — catalog, course player with Monaco code sandbox, quiz engine, student dashboard.

**Pulse** builds the Flutter companion app for mobile learners.

**Cipher** powers the in-player AI tutor — a Claude API call with the lesson transcript and student question as context, routed through Armory.

**Forge** handles deployment — separate subdomain (`academy.cirostack.com`), its own staging environment, and Postgres instance following your multi-client isolation pattern.

**Scroll** auto-publishes new course announcements to the main CiroStack blog whenever a course goes live.

Want me to generate the Ferro architecture spec (ERD + OpenAPI YAML) for this platform next, or should we start with the Figma screen list for Nova?