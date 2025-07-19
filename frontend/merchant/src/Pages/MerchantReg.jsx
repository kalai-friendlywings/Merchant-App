
// src/components/MerchantReg.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import previewImage from '../assets/merchant-preview.jpg';
import "../merchantHome.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MerchantReg = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    businessName: '',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (form.businessName && form.category) {
      localStorage.setItem('merchant_business_name', form.businessName);
      localStorage.setItem('merchant_category', form.category);
      localStorage.setItem('is_onboarded', false);

      navigate('/merchant/business/details', {
        // state: {
        //   businessName: form.businessName,
        //   category: form.category,
        // },
      });
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand text-primary fw-bold fs-4" to="/">MyMerchant</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <Link className="nav-link" to="/logout">Logout</Link>

            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row align-items-center">
          <div className="col-md-6 text-center hide-on-mobile mb-4">
            <img src={previewImage} alt="Preview" className="img-fluid" style={{ maxWidth: '90%' }} />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold mb-3">Start building your Business Profile</h2>
            <p className="text-muted mb-4">
              Help customers discover your store by completing your profile.
            </p>

            <form onSubmit={handleNext}>
              <div className="mb-3">
                <label className="form-label">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  className="form-control"
                  placeholder="Enter your business name"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Category</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Home & Appliance">Home & Appliance</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Food">Food</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>

              <p className="text-muted small">
                By continuing, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </p>

              <button type="submit" className="btn btn-primary px-4">Next</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantReg;

