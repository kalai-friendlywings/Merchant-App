import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileOverview = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/merchant/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setProfile(response.data);
      } else if (response.status === 404) {
        setProfile(null); // Profile doesn't exist yet
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null); // Profile doesn't exist yet
      } else {
        setError(error.response?.data?.detail || 'Failed to load profile');
        console.error('Error fetching profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="alert alert-info">Loading profile...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return <div className="alert alert-warning">No profile found. Please complete your profile setup.</div>;

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5>Business Details</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <p><strong>Business Name:</strong> {profile.business_name}</p>
            <p><strong>Category:</strong> {profile.category}</p>
            <p><strong>Address:</strong> {profile.address}</p>
          </div>
          <div className="col-md-6">
            <p><strong>City:</strong> {profile.city}</p>
            <p><strong>Pincode:</strong> {profile.pincode}</p>
            <p><strong>Location:</strong> {profile.latitude}, {profile.longitude}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;