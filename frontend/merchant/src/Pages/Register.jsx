import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_no: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/merchant/register/', {
        full_name: formData.full_name,
        email: formData.email,
        mobile_no: formData.mobile_no,
        password: formData.password
      });

      alert(response.data.message);
      navigate('/login'); // Redirect to login after successful registration
    } catch (error) {
      console.error(error.response?.data);
      alert("Registration failed: " + JSON.stringify(error.response?.data));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="bg-white shadow p-5 rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 fw-bold">Create an Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              name="full_name"
              type="text"
              className="form-control rounded-pill"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              name="email"
              type="email"
              className="form-control rounded-pill"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              name="mobile_no"
              type="text"
              className="form-control rounded-pill"
              placeholder="Mobile Number"
              value={formData.mobile_no}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              name="password"
              type="password"
              className="form-control rounded-pill"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <div className="mb-3">
            <input
              name="confirmPassword"
              type="password"
              className="form-control rounded-pill"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="btn w-100 rounded-pill mb-3" style={{ backgroundColor: 'teal', color: 'white' }}>
            Sign up
          </button>

          <p className="text-center small">
            Already have an account? <a href="/login" className="text-decoration-none fw-semibold" style={{ color: 'teal' }}>Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
