'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';
import UserDetailsModal from '@/components/UserDetailsModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  name: string;
  title: string;
  role: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('You do not have permission to access this page');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err?.message === 'Not authenticated') {
        router.push('/auth/signin');
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Refresh the users list
      fetchUsers();
      // If the user is currently selected in the modal, update their role there too
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err?.message === 'Not authenticated') {
        router.push('/auth/signin');
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'DEACTIVATED') => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // If the user is being deactivated, force logout their session
      if (newStatus === 'DEACTIVATED') {
        const logoutResponse = await fetch('/api/auth/force-logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (!logoutResponse.ok) {
          console.error('Failed to force logout user');
        }
      }

      // Refresh the users list
      fetchUsers();
      // If the user is currently selected in the modal, update their status there too
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err?.message === 'Not authenticated') {
        router.push('/auth/signin');
      }
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center text-white">Loading...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center text-red-400">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">Manage users and their roles from this secure admin area.</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Users'}
          </button>
        </div>
      
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-2.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-gray-500 sm:text-sm sm:leading-6"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 'ACTIVE' 
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-red-400/10 text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleUserClick(user)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleChange={(newRole) => selectedUser && handleRoleChange(selectedUser.id, newRole)}
        onStatusChange={(newStatus) => selectedUser && handleStatusChange(selectedUser.id, newStatus)}
      />
    </div>
  );
} 