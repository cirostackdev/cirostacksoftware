import Link from 'next/link';
import { Zap, Twitter, Github, Youtube } from 'lucide-react';

const links = {
  Platform: [
    { label: 'Courses', href: '/courses' },
    { label: 'Learning Paths', href: '/paths' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
  ],
  Company: [
    { label: 'CiroStack', href: 'https://cirostack.com' },
    { label: 'Blog', href: 'https://cirostack.com/blog' },
    { label: 'Talent Pipeline', href: '/about#talent' },
    { label: 'Contact', href: 'mailto:academy@cirostack.com' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Refund Policy', href: '/legal/refunds' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-[var(--color-text)]">
                CiroStack Academy
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] mb-5 leading-relaxed">
              Learn to build with AI. Real-world dev skills and AI-assisted coding for the next generation of builders.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: 'https://twitter.com/cirostack', label: 'Twitter' },
                { icon: Github, href: 'https://github.com/cirostack', label: 'GitHub' },
                { icon: Youtube, href: 'https://youtube.com/@cirostack', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-2)] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">{group}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-subtle)]">
            © {new Date().getFullYear()} CiroStack Academy. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-text-subtle)]">
            Prices in ₦ NGN for Nigeria · $ USD for international
          </p>
        </div>
      </div>
    </footer>
  );
}
