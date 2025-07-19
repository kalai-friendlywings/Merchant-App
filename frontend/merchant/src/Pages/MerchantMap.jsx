import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Function to return category-based marker icon
const getMarkerIcon = (category = 'Grocery') => {
  const colors = {
    Grocery: 'green',
    Mobile: 'blue',
    Fashion: 'violet',
    Food: 'red',
    Technology: 'skyblue',
    "Home & Appliance": 'grey',
  };

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${colors[category] || 'grey'}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
};

const MerchantMap = ({ form, setForm, businessName }) => {
  const [position, setPosition] = useState([form.latitude || 9.4, form.longitude || 78.13]);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await response.json();
      if (data?.address) {
        const fullAddress = `${data.address.road || ''}, ${data.address.city || data.address.town || data.address.village || ''}, ${data.address.country || ''}`;
        setForm((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: fullAddress,
          city: data.address.city || data.address.town || data.address.village || '',
          pincode: data.address.postcode || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const MapDragHandler = () => {
    const map = useMapEvent('dragend', () => {
      const { lat, lng } = map.getCenter();
      setPosition([lat, lng]);
      fetchAddress(lat, lng);
    });
    return null;
  };

  useEffect(() => {
    if (form.latitude && form.longitude) {
      setPosition([form.latitude, form.longitude]);
      fetchAddress(form.latitude, form.longitude);
    }
  }, [form.latitude, form.longitude]);

  return (
    <div className="merchant-map">
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }} zoomControl={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapDragHandler />

        <Marker
          key={form.category}
          position={position}
          draggable={true}
          icon={getMarkerIcon(form.category)}
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng();
              setPosition([lat, lng]);
              fetchAddress(lat, lng);
            },
          }}
        >
          <Popup>
            <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
              <strong style={{ fontSize: '16px' }}>{form.businessName}</strong><br />
              {form.address && <span><strong>Address:</strong> {form.address}<br /></span>}
              {form.city && <span><strong>City:</strong> {form.city}<br /></span>}
              {form.pincode && <span><strong>Pincode:</strong> {form.pincode}</span>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MerchantMap;