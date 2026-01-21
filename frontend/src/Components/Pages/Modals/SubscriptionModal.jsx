import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubscriptionStore } from '../../../store/subscriptionStore';
import { usePlanStore } from '../../../store/planStore';

export function SubscriptionModal({ subscription, onClose, onSuccess }) {
  const { createSubscription, updateSubscription, loading } = useSubscriptionStore();
  const { plans, fetchPlans } = usePlanStore();
  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchPlans();
    // TODO: Fetch users from API
  }, [fetchPlans]);

  useEffect(() => {
    if (subscription) {
      setFormData({
        userId: subscription.userId?._id || subscription.userId || '',
        planId: subscription.planId?._id || subscription.planId || '',
        startDate: subscription.startDate?.split('T')[0] || '',
        status: subscription.status,
      });
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        userId: formData.userId,
        planId: formData.planId,
        startDate: formData.startDate,
        status: formData.status,
      };

      if (subscription) {
        await updateSubscription(subscription._id, payload);
        toast.success('Subscription updated successfully');
      } else {
        await createSubscription(payload);
        toast.success('Subscription created successfully');
      }

      onSuccess();
    } catch (err) {
      const errorMsg = err.message || 'Operation failed';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold">
            {subscription ? 'Edit Subscription' : 'Add New Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="User's MongoDB ID"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Plan *
            </label>
            <select
              name="planId"
              value={formData.planId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a plan...</option>
              {plans.map(plan => (
                <option key={plan._id} value={plan._id}>
                  {plan.name} - ${plan.price}/month
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {subscription ? 'Update Subscription' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
