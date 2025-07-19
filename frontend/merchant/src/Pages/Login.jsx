import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/merchant/login/', {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('access_token', response.data.access); // consistent naming
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('is_onboarded', response.data.is_onboarded);

      alert('Login successful!');

      if (response.data.is_onboarded) {
        navigate('/dashboard');
      } else {
        navigate('/merchant/business');
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid credentials';
      alert(`Login failed: ${message}`);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="bg-white shadow p-5 rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 fw-bold">Log In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control rounded-pill"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control rounded-pill"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-100 rounded-pill"
            style={{ backgroundColor: 'teal', color: 'white' }}
          >
            Log In
          </button>
          <p className="text-center small mt-3">
            Don't have an account?{' '}
            <a href="/register" style={{ color: 'teal' }}>
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
