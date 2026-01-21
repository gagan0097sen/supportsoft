import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import '../styles/Auth.css';

function Plans({ onNavigate }) {
  const { user, isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPlans();
    if (isAuthenticated) {
      fetchUserSubscription();
    }
  }, [isAuthenticated]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiBaseUrl}/subscriptions/plans`);
      setPlans(response.data.data || response.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${apiBaseUrl}/subscriptions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserSubscription(response.data.data || response.data);
    } catch (err) {
      // User might not have a subscription yet
      console.log('No active subscription');
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setSubscribing(true);
      setError('');

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      console.log('Subscribing to plan ID:', planId);
      const response = await axios.post(`${apiBaseUrl}/subscriptions/create`, {
        planId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user subscription
      setUserSubscription(response.data.data || response.data);
      
      // Show success and navigate to subscription page
      alert('Subscription created successfully!');
      onNavigate('subscription');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create subscription');
      console.error('Subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setSubscribing(true);
      setError('');

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      console.log('Upgrading to plan ID:', planId);
      const response = await axios.put(`${apiBaseUrl}/subscriptions/upgrade`, {
        planId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserSubscription(response.data.data || response.data);
      alert('Subscription upgraded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upgrade subscription');
      console.error('Upgrade error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <div className="plans-container"><p>Loading plans...</p></div>;
  }

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your needs</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrentPlan = userSubscription?.planId?._id === plan._id || 
                               userSubscription?.planId === plan._id;
          
          return (
            <div key={plan._id} className={`plan-card ${isCurrentPlan ? 'active' : ''}`}>
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price.toFixed(2)}</span>
                  <span className="period">/month</span>
                </div>
              </div>

              <div className="plan-features">
                <h4>Features:</h4>
                <ul>
                  {plan.features && plan.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-action">
                {isCurrentPlan ? (
                  <button className="btn-current" disabled>
                    Current Plan
                  </button>
                ) : userSubscription ? (
                  <button
                    className="btn-upgrade"
                    onClick={() => handleUpgrade(plan._id)}
                    disabled={subscribing}
                  >
                    {subscribing ? 'Processing...' : 'Upgrade to ' + plan.name}
                  </button>
                ) : (
                  <button
                    className="btn-subscribe"
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={subscribing}
                  >
                    {subscribing ? 'Processing...' : 'Subscribe Now'}
                  </button>
                )}
              </div>

              {isCurrentPlan && (
                <div className="plan-badge">Active Subscription</div>
              )}
            </div>
          );
        })}
      </div>

      {userSubscription && (
        <div className="current-subscription-info">
          <h3>Your Current Subscription</h3>
          <div className="subscription-details">
            <p>
              <strong>Plan:</strong> {userSubscription.planName}
            </p>
            <p>
              <strong>Status:</strong> <span className={`status ${userSubscription.status}`}>{userSubscription.status.toUpperCase()}</span>
            </p>
            <p>
              <strong>Amount:</strong> ${userSubscription.amount}/month
            </p>
            {userSubscription.nextBillingDate && (
              <p>
                <strong>Next Billing:</strong> {new Date(userSubscription.nextBillingDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            className="btn-view-details"
            onClick={() => onNavigate('subscription')}
          >
            View Subscription Details
          </button>
        </div>
      )}
    </div>
  );
}

export { Plans as PlansPage };
export default Plans;
