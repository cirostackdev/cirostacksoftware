'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { toast } from '@/lib/store/useToastStore';
import { apiPatch } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    username: user?.username ?? '',
    languagePreference: user?.languagePreference ?? 'en',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await apiPatch('/users/me', form);
      updateUser(form);
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-10">
      {/* Profile */}
      <section>
        <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-6">Profile</h2>
        <div className="space-y-5">
          {user && (
            <div className="flex items-center gap-4">
              <Avatar src={user.avatarUrl} name={user.fullName} size="lg" />
              <Button variant="outline" size="sm">Change photo</Button>
            </div>
          )}
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            hint="academy.cirostack.com/u/your-username"
          />
          <Input label="Email address" value={user?.email ?? ''} disabled hint="Contact support to change your email." />
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-6">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Language
            </label>
            <select
              value={form.languagePreference}
              onChange={(e) => setForm({ ...form, languagePreference: e.target.value as 'en' | 'pcm' })}
              className="h-10 w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#E82121]"
            >
              <option value="en">English</option>
              <option value="pcm">Nigerian Pidgin English</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
              Theme
            </label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize border transition-colors ${
                    theme === t
                      ? 'border-[#E82121] bg-[#E82121]/10 text-[#E82121]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-2)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Button onClick={handleSave} isLoading={isSaving}>Save changes</Button>

      {/* Danger zone */}
      <section className="border-t border-[var(--color-border)] pt-8">
        <h2 className="font-display text-lg font-semibold text-[#EF4444] mb-2">Danger zone</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Permanently delete your account and all associated data.
        </p>
        <Button variant="destructive" size="sm">Delete account</Button>
      </section>
    </div>
  );
}
