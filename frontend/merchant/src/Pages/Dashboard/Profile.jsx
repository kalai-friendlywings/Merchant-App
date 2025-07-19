// src/pages/Dashboard/Profile.jsx
import React, { useState } from 'react';
import ProfileOverview from './ProfileOverview';
import EditProfile from './EditProfile';
import { Nav } from 'react-bootstrap';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <h3 className="mb-4">My Profile</h3>

      {/* Bootstrap Nav Tabs */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="overview">Overview</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="edit">Edit Profile</Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Content */}
      {activeTab === 'overview' && <ProfileOverview />}
      {activeTab === 'edit' && <EditProfile />}
    </div>
  );
};

export default Profile;
