import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { Calendar, DollarSign, AlertCircle, RotateCcw, Trash2, Loader } from 'lucide-react';

function SubscriptionPage() {
  const navigate = useNavigate();
  const {
    mySubscription,
    subscriptionHistory,
    loading,
    fetchMySubscription,
    fetchSubscriptionHistory,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState('current');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchMySubscription();
    fetchSubscriptionHistory();
  }, [fetchMySubscription, fetchSubscriptionHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    try {
      setIsProcessing(true);
      await cancelSubscription(mySubscription._id);
      toast.success('Subscription cancelled successfully');
      await fetchMySubscription();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsProcessing(true);
      await reactivateSubscription(mySubscription._id);
      toast.success('Subscription reactivated successfully');
      await fetchMySubscription();
    } catch (error) {
      toast.error(error.message || 'Failed to reactivate subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && !mySubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'current' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:border-gray-400'
            }`}
          >
            Current Subscription
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:border-gray-400'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'current' && (
          <>
            {mySubscription ? (
              <div className="bg-white rounded-lg shadow p-8">
                {mySubscription.status !== 'active' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Inactive Subscription</p>
                      <p className="text-sm text-yellow-700">Your subscription is {mySubscription.status}.</p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex gap-4">
                    <DollarSign className="text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="font-semibold text-lg">{mySubscription.planId?.name}</p>
                      <p className="text-gray-700">${mySubscription.planId?.price}/month</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Calendar className="text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-semibold text-lg">{formatDate(mySubscription.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Calendar className="text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-semibold text-lg">{formatDate(mySubscription.endDate)}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${mySubscription.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-lg font-semibold capitalize ${mySubscription.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {mySubscription.status}
                    </p>
                  </div>
                </div>

                {mySubscription.planId?.features && mySubscription.planId.features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Features Included</h3>
                    <ul className="space-y-2">
                      {mySubscription.planId.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  {mySubscription.status === 'active' ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isProcessing ? 'Cancelling...' : 'Cancel Subscription'}
                      </button>
                      <button
                        onClick={() => navigate('/plans')}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Change Plan
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleReactivate}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-10 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-6">You don't have an active subscription</p>
                <button
                  onClick={() => navigate('/plans')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Plans
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {subscriptionHistory?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Plan</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Start Date</th>
                    <th className="p-4 text-left font-semibold text-gray-700">End Date</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Price</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionHistory.map((sub) => (
                    <tr key={sub._id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-900 font-medium">{sub.planId?.name}</td>
                      <td className="p-4 text-gray-600">{formatDate(sub.startDate)}</td>
                      <td className="p-4 text-gray-600">{formatDate(sub.endDate)}</td>
                      <td className="p-4 font-semibold text-gray-900">${sub.planId?.price}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          sub.status === 'active' ? 'bg-green-100 text-green-800' : sub.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-8 text-center text-gray-600">No subscription history found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { SubscriptionPage };
export default SubscriptionPage;
