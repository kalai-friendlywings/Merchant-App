// src/pages/Dashboard/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    address: '',
    city: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/merchant/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const {
          business_name = '',
          category = '',
          address = '',
          city = '',
          pincode = '',
          latitude = '',
          longitude = '',
        } = response.data;

        setFormData({
          business_name,
          category,
          address,
          city,
          pincode,
          latitude,
          longitude,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      await axios.patch('http://localhost:8000/api/merchant/profile/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Profile update failed.');
    }
  };

  if (loading) return <div className="alert alert-info">Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {success && <div className="alert alert-success">Profile updated successfully!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label>Business Name</label>
        <input
          type="text"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Select Category</option>
          <option value="Grocery">Grocery</option>
          <option value="Mobile">Mobile</option>
          <option value="Fashion">Fashion</option>
          <option value="Food">Food</option>
          <option value="Technology">Technology</option>
          <option value="Home & Appliance">Home & Appliance</option>
        </select>
      </div>

      <div className="mb-3">
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="form-control"
          rows="2"
          required
        />
      </div>

      <div className="row mb-3">
        <div className="col">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col">
          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label>Latitude</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="col">
          <label>Longitude</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">Update Profile</button>
    </form>
  );
};

export default EditProfile;
