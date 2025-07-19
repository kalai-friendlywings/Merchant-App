import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown, FaPlus, FaEdit } from 'react-icons/fa';
import { MdInsights } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import ProfileBanner from './ProfileBanner';
import api from '../../services/api';
import './Home.css';
import './ProfileBanner.css'

const DashboardHome = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    bannerImage: null,
    profileImage: null,
    loading: true,
    error: null,
  });
  
  const dailyStats = [
    { label: 'New Orders', value: 15, color: 'success' },
    { label: 'Pending Orders', value: 7, color: 'warning' },
    { label: 'Returned Orders', value: 2, color: 'danger' },
  ];

  const stats = [
    { title: 'Total Sales', value: '$4,500', trend: 'up', change: '15%' },
    { title: 'New Customers', value: '125', trend: 'down', change: '5%' },
    { title: 'Total Products', value: '200', trend: 'up', change: '8%' },
    { title: 'Total Revenue', value: '$10,000', trend: 'up', change: '12%' },
    { title: 'Shop Rating', value: '4.6 ★', trend: 'up', change: '2%' },
    { title: 'Followers', value: '1.2K', trend: 'up', change: '9%' },
  ];

  const visitorData = [30, 50, 70, 60, 90, 80, 50];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const topProducts = [
    { name: 'Product A', sales: 150 },
    { name: 'Product B', sales: 120 },
    { name: 'Product C', sales: 100 },
    { name: 'Product D', sales: 80 },
  ];
  // ... (keep the static data same as before)

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        const response = await api.get('merchant-profile/images/');
        setDashboardData({
          bannerImage: response.data.banner_image_url,
          profileImage: response.data.profile_image_url,
          businessName: response.data.business_name, 
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Profile load error:', error);
        setDashboardData({
          bannerImage: null,
          profileImage: null,
          businessName: null,
          loading: false,
          error: error.response?.data?.error || 'Failed to load profile'
        });
      }
    };
    fetchMerchantData();
  }, []);

  const handleImageUpdate = async (file, type) => {
    try {
      const formData = new FormData();
      const fieldName = type === 'banner' ? 'banner_image' : 'profile_image';

      if (file === 'DELETE') {
        formData.append(fieldName, ''); // Send empty string for deletion
      } else {
        formData.append(fieldName, file);
      }

      const response = await api.patch('merchant-profile/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return {
        url: response.data[`${fieldName}_url`],
        error: null
      };
    } catch (error) {
      console.error('Update error:', error);
      return { 
        error: error.response?.data?.error || 'Image update failed' 
      };
    }
  };

  const handleBannerChange = async (file) => {
    setDashboardData(prev => ({ ...prev, bannerImage: 'loading' }));
    const { url, error } = await handleImageUpdate(file, 'banner');
    setDashboardData(prev => ({
      ...prev,
      bannerImage: url || null,
      error: error || prev.error
    }));
  };

  const handleProfileChange = async (file) => {
    setDashboardData(prev => ({ ...prev, profileImage: 'loading' }));
    const { url, error } = await handleImageUpdate(file, 'merchant-profile');
    setDashboardData(prev => ({
      ...prev,
      profileImage: url || null,
      error: error || prev.error
    }));
  };
  if (dashboardData.loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="px-3 py-4 dashboard-container">
      {dashboardData.error && (
        <Alert variant="danger" className="mb-4" dismissible>
          {dashboardData.error}
        </Alert>
      )}

      <Row className="justify-content-center mb-4">
        <Col xs={12}>
      
<ProfileBanner
  bannerImage={dashboardData.bannerImage}
  profileImage={dashboardData.profileImage}
  name={dashboardData.businessName || "Your Business"}
  welcomeText="Welcome back! Ready to grow your business today?"
  onBannerChange={handleBannerChange}
  onProfileChange={handleProfileChange}
/>
  
          
        </Col>
      </Row>

      {/* Quick Actions & Summary */}
      <Row className="mt-4 g-4">
        <Col xs={12} md={4}>
          <Card className="h-100 shadow-sm quick-actions-card">
            <Card.Body>
              <h5 className="fw-bold mb-3">Quick Actions</h5>
              <Button
                variant="primary"
                className="w-100 mb-3 action-button"
                onClick={() => navigate('/dashboard/products')}
              >
                <FaPlus className="me-2" /> Add Product
              </Button>
              <Button
                variant="outline-primary"
                className="w-100 action-button"
                onClick={() => navigate('/dashboard/edit-profile')}
              >
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8}>
          <Card className="h-100 shadow-sm summary-card">
            <Card.Body>
              <h5 className="fw-bold mb-3">Today's Summary</h5>
              <Row className="g-3">
                {dailyStats.map((item, index) => (
                  <Col xs={12} sm={4} key={`stat-${index}`}>
                    <div className={`stat-badge stat-${item.color}`}>
                      <div className="stat-value">{item.value}</div>
                      <div className="stat-label">{item.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Metrics Section */}
      <Row className="mt-4 g-4">
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} lg={3} key={`metric-${index}`}>
            <Card className="h-100 shadow-sm metric-card">
              <Card.Body>
                <h6 className="metric-title">{stat.title}</h6>
                <div className="metric-content">
                  <h3 className="metric-value">{stat.value}</h3>
                  <span className={`metric-change ${stat.trend}`}>
                    {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />} {stat.change}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Store Insights */}
      <Row className="mt-4 mb-5 g-4">
        <Col xs={12}>
          <Card className="shadow-sm insights-card">
            <Card.Body>
              <div className="insights-header d-flex justify-content-between align-items-center">
                <div className="insights-title d-flex align-items-center">
                  <MdInsights className="me-2 text-primary" size={24} />
                  <h5 className="mb-0 fw-bold">Store Insights</h5>
                </div>
                <Button variant="outline-primary" size="sm">View All</Button>
              </div>

              <Row className="g-4 mt-3">
                <Col md={7}>
                  <div className="analytics-section">
                    <h6 className="section-title">Visitor Analytics</h6>
                    <small className="section-subtitle">Last 7 days</small>
                    <div className="analytics-chart d-flex align-items-end gap-2" style={{ height: '120px' }}>
                      {visitorData.map((height, i) => (
                        <div
                          key={`bar-${i}`}
                          className="chart-bar-container"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                        >
                          <div
                            className="chart-bar bg-primary"
                            style={{ height: `${height}%`, width: '20px', borderRadius: '4px' }}
                            title={`${daysOfWeek[i]}: ${height} visitors`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between mt-1 analytics-labels">
                      {daysOfWeek.map((day, idx) => (
                        <small key={`label-${idx}`} className="text-muted">{day}</small>
                      ))}
                    </div>
                  </div>
                </Col>

                <Col md={5}>
                  <div className="top-products-section">
                    <h6 className="section-title">Top Products</h6>
                    <small className="section-subtitle">By Sales</small>
                    <ul className="list-unstyled mt-3">
                      {topProducts.map((product, i) => (
                        <li key={`top-product-${i}`} className="d-flex justify-content-between align-items-center mb-2">
                          <span>{product.name}</span>
                          <span className="text-primary fw-bold">{product.sales}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardHome;
