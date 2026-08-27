import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { adminService } from './services/adminService';
import type { User, Booking } from '../../types';
import styles from './AdminUsersPage.module.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Bookings Modal
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const list = await adminService.getUsers({
      search: searchQuery,
      role: roleFilter,
      status: statusFilter,
    });
    setUsers(list);
    setIsLoading(false);
  };

  const handleToggleBan = async (user: User) => {
    const isBanned = user.status === 'BANNED';
    const action = isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} user "${user.name}"?`)) return;

    try {
      if (isBanned) {
        await adminService.unbanUser(user.id);
        toast.success(`User "${user.name}" restored to active state.`);
      } else {
        await adminService.banUser(user.id);
        toast.success(`User "${user.name}" banned.`);
      }
      fetchUsers();
    } catch {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleInspectUserBookings = async (user: User) => {
    setInspectUser(user);
    const allBkgs = await adminService.getPlatformBookings();
    setUserBookings(allBkgs.filter((b) => b.userId === user.id || b.userName === user.name));
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Platform User Management</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Manage customer accounts, facility owner partners, roles, and ban status.
        </p>
      </div>

      {/* Filter Controls */}
      <div className={styles.filterBar}>
        <div className={styles.searchInput}>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.selectInput}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Customer</option>
          <option value="FACILITY_OWNER">Facility Owner</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          className={styles.selectInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div style={{ height: 280, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No users found matching your search filters.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.name[0]?.toUpperCase()}</div>
                      <div>
                        <div className={styles.userName}>{u.name}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{u.role}</strong>
                  </td>
                  <td>
                    <span
                      className={u.status === 'ACTIVE' ? styles.badgeActive : styles.badgeBanned}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspectUserBookings(u)}
                      >
                        Bookings
                      </Button>
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleBan(u)}
                        >
                          {u.status === 'ACTIVE' ? 'Ban' : 'Unban'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Bookings Inspector Modal */}
      {inspectUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2 className={styles.modalTitle}>Bookings by {inspectUser.name}</h2>
            {userBookings.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No bookings created yet by this user.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 240, overflowY: 'auto' }}>
                {userBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--color-surface-2)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div><strong>{b.facilityName}</strong> ({b.courtName})</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      📅 {b.bookingDate} ({b.startTime} – {b.endTime}) • ₹{b.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={() => setInspectUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
