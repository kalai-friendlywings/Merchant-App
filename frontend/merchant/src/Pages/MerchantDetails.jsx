
// src/components/MerchantDetails.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const getMarkerIcon = (category = 'Grocery') => {
  const colors = {
    Grocery: 'green',
    Mobile: 'blue',
    Fashion: 'violet',
    Food: 'red',
    Technology: 'orange',
    "Home & Appliance": 'grey',
  };
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${colors[category] || 'green'}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
};

const MerchantDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialLat = 9.4;
  const initialLng = 78.13;

  const [position, setPosition] = useState([initialLat, initialLng]);

  const [form, setForm] = useState({
     businessName: localStorage.getItem('merchant_business_name') || '',
  category: localStorage.getItem('merchant_category') || '',
    address: '',
    city: '',
    pincode: '',
    latitude: initialLat,
    longitude: initialLng,
  });

  const updateAddressByCoords = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const address = data.display_name || '';
      const city = data.address.city || data.address.town || data.address.village || '';
      const pincode = data.address.postcode || '';
      setForm(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        address,
        city,
        pincode,
      }));
    } catch (error) {
      console.error('Address fetch failed:', error);
    }
  };

  const MapDragHandler = () => {
    useMapEvent('dragend', (e) => {
      const center = e.target.getCenter();
      setPosition([center.lat, center.lng]);
      updateAddressByCoords(center.lat, center.lng);
    });
    return null;
  };

  useEffect(() => {
    updateAddressByCoords(position[0], position[1]);
    const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("No token found. Redirecting to login.");
    navigate("/login");
  }
   
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('access_token');
    console.log('Token:', token);

    // Convert numbers to strings and ensure proper format
    const payload = {
      business_name: form.businessName,
      category: form.category,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      latitude: parseFloat(form.latitude).toFixed(6), // Ensure 6 decimal places
      longitude: parseFloat(form.longitude).toFixed(6),
    };

    console.log("Submitting payload:", payload);

    const response = await axios.post(
      'http://localhost:8000/api/merchant/profile/', 
      payload, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201) {
      alert('Merchant details submitted successfully!');
      localStorage.setItem('is_onboarded', 'true');
      navigate('/dashboard');
    }
  } catch (err) {
    console.error('Full error object:', err);
    console.error('Submission error details:', err.response?.data);
    alert(`Submission failed: ${JSON.stringify(err.response?.data || err.message)}`);
  }
};



  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">MyMerchant</Link>
        </div>
      </nav>

      <div className="container my-5">
        <h3 className="fw-bold mb-3 text-center">{form.businessName}</h3>
        <p className="text-muted text-center">Mark your shop location by dragging the map</p>

        <MapContainer center={position} zoom={15} style={{ height: '300px', width: '100%' }} scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={getMarkerIcon(form.category)}>
            <Popup>{form.businessName}</Popup>
          </Marker>
          <MapDragHandler />
        </MapContainer>

        <form className="mt-4">
          <div className="mb-3">
            <label className="form-label">Full Address</label>
            <textarea
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              rows="2"
              required
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">City</label>
              <input
                className="form-control"
                name="city"
                value={form.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Pincode</label>
              <input
                className="form-control"
                name="pincode"
                value={form.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="text-end">
            <button type="button" className="btn btn-primary px-4" onClick={handleSubmit}>Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MerchantDetails;

