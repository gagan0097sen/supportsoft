export { RegisterPage } from './Auth';

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      await axios.post(`${BASE_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

        {serverError && <div className="error-message">{serverError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input placeholder="Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <input type="password" placeholder="Confirm Password" onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />

          <button disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
