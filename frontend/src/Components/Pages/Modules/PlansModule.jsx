import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePlanStore } from '../../../store/planStore';
import { PlanModal } from '../Modals/PlanModal';

export function PlansModule() {
  const { plans, loading, fetchPlans, deletePlan } = usePlanStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filteredPlans = filterStatus === 'all' 
    ? plans 
    : plans.filter(plan => plan.active === (filterStatus === 'active'));

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deletePlan(planId);
      toast.success('Plan deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Plans Management</h2>
        <button
          onClick={() => {
            setSelectedPlan(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
        >
          <Plus size={20} />
          Add New Plan
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
          <option value="all">All Plans</option>
          <option value="active">Active Plans</option>
          <option value="inactive">Inactive Plans</option>
        </select>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No plans found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Plan Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-blue-100 text-sm mt-1">{plan.description}</p>
              </div>

              {/* Plan Body */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Price</p>
                  <p className="text-3xl font-bold text-gray-900">${plan.price}/month</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Duration</p>
                  <p className="text-gray-900 font-semibold">
                    {plan.duration.value} {plan.duration.unit}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-2">Features</p>
                  <ul className="space-y-1">
                    {plan.features && plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                    {plan.features && plan.features.length > 3 && (
                      <li className="text-gray-500 text-sm">+{plan.features.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    plan.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Plan Footer */}
              <div className="bg-gray-50 px-6 py-4 flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition font-medium"
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-medium"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PlanModal 
          plan={selectedPlan} 
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}
