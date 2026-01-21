import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubscriptionStore } from '../../../store/subscriptionStore';
import { SubscriptionModal } from '../Modals/SubscriptionModal';

export function SubscriptionModule() {
  const { subscriptions, loading, fetchSubscriptions, deleteSubscription } = useSubscriptionStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired' || sub.status === 'cancelled');

  let filteredSubs = subscriptions;
  if (filterStatus === 'active') {
    filteredSubs = activeSubscriptions;
  } else if (filterStatus === 'expired') {
    filteredSubs = expiredSubscriptions;
  }

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setShowModal(true);
  };

  const handleDelete = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await deleteSubscription(subscriptionId);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions Management</h2>
        <button
          onClick={() => {
            setSelectedSubscription(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
        >
          <Plus size={20} />
          Add New Subscription
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-gray-600" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Subscriptions</option>
          <option value="active">Active Subscriptions</option>
          <option value="expired">Expired Subscriptions</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Active Subscriptions</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeSubscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Expired Subscriptions</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{expiredSubscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Subscriptions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{subscriptions.length}</p>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <h3 className="text-lg font-bold">Active Subscriptions ({activeSubscriptions.length})</h3>
        </div>
        {activeSubscriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No active subscriptions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSubscriptions.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{sub.userEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{sub.planName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(sub.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(sub.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">${sub.planPrice}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expired/Cancelled Subscriptions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 text-white">
          <h3 className="text-lg font-bold">Expired/Cancelled Subscriptions ({expiredSubscriptions.length})</h3>
        </div>
        {expiredSubscriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No expired or cancelled subscriptions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expiredSubscriptions.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{sub.userEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{sub.planName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(sub.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <SubscriptionModal 
          subscription={selectedSubscription} 
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchSubscriptions();
          }}
        />
      )}
    </div>
  );
}
