


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // ================= FETCH ALL USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('accessToken');

      const res = await axios.get(`${BASE_URL}/admin/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetched users:', res.data);

      // ✅ FIX: users array is inside res.data.data
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('accessToken');

      const res = await axios.delete(`${BASE_URL}/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Delete response:', res.data);

      toast.success('User deleted successfully');

      // ✅ Update UI instantly
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // ================= FILTER USERS =================
  const filteredUsers =
    roleFilter === 'all'
      ? users
      : users.filter((user) => user?.role === roleFilter);

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">All Users</h2>

        {/* ================= FILTER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          <label className="font-medium mb-2 md:mb-0">Filter by Role:</label>
          <select
            className="border border-gray-300 rounded px-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader size={28} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* ================= EMPTY ================= */}
        {!loading && filteredUsers.length === 0 && (
          <p className="text-gray-600 text-center">No users found.</p>
        )}

        {/* ================= USERS TABLE ================= */}
        {filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg divide-y divide-gray-200 shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-50 ${
                      idx % 2 !== 0 ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono truncate max-w-xs">
                      {user._id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {user.role}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={() => toast('Edit feature coming soon!')}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllUsers;
