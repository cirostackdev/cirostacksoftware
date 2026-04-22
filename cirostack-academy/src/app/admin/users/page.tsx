'use client';

import { useState, useEffect } from 'react';
import { Search, UserCog, ShieldOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/lib/store/useToastStore';
import { apiGet, apiPatch } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: 'student' | 'instructor' | 'admin' | 'banned';
  xpTotal: number;
  createdAt: string;
  emailVerifiedAt: string | null;
}

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiGet<AdminUser[]>(`/admin/users?search=${encodeURIComponent(search)}&limit=50`)
      .then(setUsers)
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setIsLoading(false));
  }, [search]);

  const changeRole = async (id: string, role: string) => {
    try {
      const updated = await apiPatch<AdminUser>(`/admin/users/${id}`, { role });
      setUsers((prev) => prev.map((u) => u.id === id ? updated : u));
      toast.success(`Role updated to ${role}.`);
      setSelectedUser(null);
    } catch {
      toast.error('Failed to update role.');
    }
  };

  const toggleSuspend = async (user: AdminUser) => {
    const isBanned = user.role === 'banned';
    const newRole = isBanned ? 'student' : 'banned';
    try {
      const updated = await apiPatch<AdminUser>(`/admin/users/${user.id}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
      toast.success(isBanned ? 'User unsuspended.' : 'User suspended.');
      setSelectedUser(null);
    } catch {
      toast.error('Failed to update user.');
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#E53935]"
          />
        </div>
        <p className="self-center text-sm text-[var(--color-text-muted)]">{users.length} users</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden xl:table-cell">XP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users.map((u) => {
                const isBanned = u.role === 'banned';
                const displayRole = isBanned ? 'student' : u.role;
                return (
                  <tr key={u.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={null} name={u.fullName} size="sm" />
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{u.fullName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant={displayRole === 'admin' ? 'danger' : displayRole === 'instructor' ? 'purple' : 'default'} className="capitalize text-[10px]">
                        {displayRole}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-sm text-[var(--color-text-muted)]">{u.xpTotal.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isBanned ? (
                        <Badge variant="danger" className="text-[10px]">Suspended</Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" leftIcon={<UserCog className="h-3.5 w-3.5" />} onClick={() => setSelectedUser(u)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Manage: ${selectedUser?.fullName}`}>
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-2">Change role</p>
              <div className="flex gap-2 flex-wrap">
                {(['student', 'instructor', 'admin'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={selectedUser.role === role ? 'primary' : 'outline'}
                    size="sm"
                    className="capitalize"
                    onClick={() => changeRole(selectedUser.id, role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
            <div className="border-t border-[var(--color-border)] pt-4">
              <Button
                variant={selectedUser.role === 'banned' ? 'outline' : 'destructive'}
                size="sm"
                leftIcon={<ShieldOff className="h-3.5 w-3.5" />}
                onClick={() => toggleSuspend(selectedUser)}
              >
                {selectedUser.role === 'banned' ? 'Unsuspend user' : 'Suspend user'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
