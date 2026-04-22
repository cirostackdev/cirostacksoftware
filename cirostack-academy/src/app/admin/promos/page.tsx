'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import type { PromoCode } from '@/types';

export default function PromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', type: 'percentage', value: '', usageLimit: '' });

  useEffect(() => {
    setIsLoading(true);
    apiGet<PromoCode[]>('/payments/admin/promo-codes')
      .then(setPromos)
      .catch(() => toast.error('Failed to load promo codes.'))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const updated = await apiPatch<PromoCode>(`/payments/admin/promo-codes/${id}`, { isActive: !current });
      setPromos((prev) => prev.map((p) => p.id === id ? updated : p));
      toast.success('Promo code updated.');
    } catch {
      toast.error('Failed to update promo code.');
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await apiDelete(`/payments/admin/promo-codes/${id}`);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Promo code deleted.');
    } catch {
      toast.error('Failed to delete promo code.');
    }
  };

  const createPromo = async () => {
    if (!newPromo.code || !newPromo.value) { toast.error('Fill in all required fields.'); return; }
    try {
      const created = await apiPost<PromoCode>('/payments/admin/promo-codes', {
        code: newPromo.code.toUpperCase(),
        type: newPromo.type,
        value: Number(newPromo.value),
        usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : undefined,
      });
      setPromos((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setNewPromo({ code: '', type: 'percentage', value: '', usageLimit: '' });
      toast.success('Promo code created!');
    } catch {
      toast.error('Failed to create promo code.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">{promos.length} promo codes</p>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>
          Create code
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Usage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      <span className="font-mono font-semibold text-[var(--color-text)]">{p.code}</span>
                      {p.courseId && <Badge variant="blue" className="text-[10px]">Course-specific</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {p.type === 'percentage' ? `${p.value}% off` : `₦${(p.value / 100).toLocaleString()} off`}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--color-text-muted)]">
                    {p.usageCount} / {p.usageLimit ?? '∞'}
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <Badge variant="success" className="text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px]">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(p.id, p.isActive)}>
                        {p.isActive ? <XCircle className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /> : <CheckCircle className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePromo(p.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-[var(--color-text-muted)] hover:text-[#EF4444]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">No promo codes yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create promo code" size="sm">
        <div className="space-y-4">
          <Input label="Code" placeholder="LAUNCH50" value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} required />
          <div>
            <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">Type</label>
            <select value={newPromo.type} onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value })} className="w-full h-10 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-sm px-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#E53935]">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <Input label="Value" placeholder={newPromo.type === 'percentage' ? '50' : '5000'} value={newPromo.value} onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })} required hint={newPromo.type === 'percentage' ? 'Enter percentage (0–100)' : 'Enter amount in kobo (₦50 = 5000)'} />
          <Input label="Usage limit (optional)" placeholder="100" value={newPromo.usageLimit} onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })} hint="Leave blank for unlimited" />
          <Button fullWidth onClick={createPromo}>Create promo code</Button>
        </div>
      </Modal>
    </div>
  );
}
