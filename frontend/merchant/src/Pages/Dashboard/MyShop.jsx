// File: src/Pages/Dashboard/MyShop.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Image, Tab, Tabs, Modal } from 'react-bootstrap';
import { 
  FaStore, 
  FaEdit, 
  FaUpload, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import './MyShop.css';

const MyShop = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [shopData, setShopData] = useState({
    name: "Mugunthan's Fashion Boutique",
    description: "Premium clothing and accessories for men and women. We offer high-quality products with the latest fashion trends.",
    category: "Fashion & Apparel",
    contact: "+1 (555) 123-4567",
    email: "contact@mugunthanshop.com",
    website: "www.mugunthanshop.com",
    address: "123 Fashion Street, New York, NY 10001",
    hours: {
      monday: "9:00 AM - 7:00 PM",
      tuesday: "9:00 AM - 7:00 PM",
      wednesday: "9:00 AM - 7:00 PM",
      thursday: "9:00 AM - 9:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "10:00 AM - 6:00 PM",
      sunday: "Closed"
    },
    status: "active",
    logo: "https://via.placeholder.com/150",
    banner: "https://via.placeholder.com/1200x400"
  });

  const [editForm, setEditForm] = useState({ ...shopData });

  const handleSaveChanges = () => {
    setShopData(editForm);
    setShowEditModal(false);
  };

  return (
    <div className="my-shop-container">
      {/* Shop Banner */}
      <div className="shop-banner">
        <Image src={shopData.banner} fluid className="banner-image" />
        <div className="banner-overlay">
          <div className="shop-logo-container">
            <Image src={shopData.logo} roundedCircle className="shop-logo" />
          </div>
        </div>
      </div>

      {/* Shop Header */}
      <Container className="shop-header mt-5">
        <Row className="align-items-end">
          <Col md={8}>
            <div className="d-flex align-items-center">
              <h1 className="shop-name mb-0">{shopData.name}</h1>
              <span className={`shop-status ms-3 ${shopData.status}`}>
                {shopData.status === 'active' ? <FaCheckCircle className="me-1" /> : <FaTimesCircle className="me-1" />}
                {shopData.status.charAt(0).toUpperCase() + shopData.status.slice(1)}
              </span>
            </div>
            <p className="shop-category text-muted mt-1">
              <FiPackage className="me-2" />
              {shopData.category}
            </p>
            <p className="shop-description mt-3">{shopData.description}</p>
          </Col>
          <Col md={4} className="text-md-end">
            <Button 
              variant="primary" 
              className="edit-shop-btn"
              onClick={() => setShowEditModal(true)}
            >
              <FaEdit className="me-2" /> Edit Shop
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Main Content */}
      <Container className="my-5">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="shop-tabs mb-4"
        >
          <Tab eventKey="profile" title="Shop Profile" />
          <Tab eventKey="settings" title="Shop Settings" />
          <Tab eventKey="appearance" title="Appearance" />
        </Tabs>

        <Tab.Content>
          <Tab.Pane eventKey="profile">
            <Row>
              <Col lg={8}>
                <Card className="shop-details-card mb-4">
                  <Card.Body>
                    <h5 className="card-title">Shop Details</h5>
                    <div className="detail-item">
                      <FaStore className="detail-icon" />
                      <div>
                        <h6>Shop Name</h6>
                        <p>{shopData.name}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaEnvelope className="detail-icon" />
                      <div>
                        <h6>Email</h6>
                        <p>{shopData.email}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaPhone className="detail-icon" />
                      <div>
                        <h6>Contact Number</h6>
                        <p>{shopData.contact}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaGlobe className="detail-icon" />
                      <div>
                        <h6>Website</h6>
                        <p>{shopData.website}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <div>
                        <h6>Address</h6>
                        <p>{shopData.address}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="opening-hours-card mb-4">
                  <Card.Body>
                    <h5 className="card-title">Opening Hours</h5>
                    {Object.entries(shopData.hours).map(([day, hours]) => (
                      <div key={day} className="hour-item">
                        <div className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                        <div className="hours">{hours}</div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="quick-stats-card mb-4">
                  <Card.Body>
                    <h5 className="card-title">Shop Stats</h5>
                    <div className="stat-item">
                      <div className="stat-label">Total Products</div>
                      <div className="stat-value">42</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Monthly Visitors</div>
                      <div className="stat-value">1,243</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Customer Rating</div>
                      <div className="stat-value">4.8/5.0</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Orders This Month</div>
                      <div className="stat-value">87</div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="verification-card">
                  <Card.Body>
                    <h5 className="card-title">Verification Status</h5>
                    <div className="verification-item verified">
                      <FaCheckCircle className="me-2" />
                      Email Verified
                    </div>
                    <div className="verification-item verified">
                      <FaCheckCircle className="me-2" />
                      Phone Verified
                    </div>
                    <div className="verification-item pending">
                      <FaCheckCircle className="me-2" />
                      Business Verification (Pending)
                    </div>
                    <Button variant="outline-primary" className="w-100 mt-3">
                      Complete Verification
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          <Tab.Pane eventKey="settings">
            <Card className="settings-card">
              <Card.Body>
                <h5 className="card-title">Shop Settings</h5>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Shop Status</Form.Label>
                    <Form.Select value={shopData.status}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="vacation">On Vacation</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Notification Preferences</Form.Label>
                    <Form.Check 
                      type="switch"
                      id="email-notifications"
                      label="Email Notifications"
                      defaultChecked
                    />
                    <Form.Check 
                      type="switch"
                      id="sms-notifications"
                      label="SMS Notifications"
                      defaultChecked
                    />
                    <Form.Check 
                      type="switch"
                      id="promo-notifications"
                      label="Promotional Offers"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Order Processing Time</Form.Label>
                    <Form.Select>
                      <option>Same Day</option>
                      <option>1-2 Business Days</option>
                      <option>3-5 Business Days</option>
                      <option>1 Week</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" className="save-settings-btn">
                    Save Settings
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="appearance">
            <Row>
              <Col md={6}>
                <Card className="appearance-card mb-4">
                  <Card.Body>
                    <h5 className="card-title">Shop Logo</h5>
                    <div className="logo-upload-container">
                      <Image src={shopData.logo} roundedCircle className="current-logo" />
                      <div className="upload-controls">
                        <Button variant="outline-secondary" className="mb-2">
                          <FaUpload className="me-2" /> Upload New Logo
                        </Button>
                        <p className="text-muted small">Recommended size: 300x300px</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="appearance-card mb-4">
                  <Card.Body>
                    <h5 className="card-title">Shop Banner</h5>
                    <div className="banner-preview-container">
                      <Image src={shopData.banner} fluid className="banner-preview" />
                      <Button variant="outline-secondary" className="mt-3">
                        <FaUpload className="me-2" /> Upload New Banner
                      </Button>
                      <p className="text-muted small mt-2">Recommended size: 1200x400px</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="theme-card">
              <Card.Body>
                <h5 className="card-title">Shop Theme</h5>
                <Row className="theme-options">
                  <Col sm={4} className="mb-3">
                    <div className="theme-option active">
                      <div className="theme-preview purple-theme"></div>
                      <p className="theme-name">Purple Elegance</p>
                    </div>
                  </Col>
                  <Col sm={4} className="mb-3">
                    <div className="theme-option">
                      <div className="theme-preview blue-theme"></div>
                      <p className="theme-name">Ocean Blue</p>
                    </div>
                  </Col>
                  <Col sm={4} className="mb-3">
                    <div className="theme-option">
                      <div className="theme-preview green-theme"></div>
                      <p className="theme-name">Nature Green</p>
                    </div>
                  </Col>
                </Row>
                <Button variant="primary" className="save-theme-btn">
                  Apply Theme
                </Button>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Container>

      {/* Edit Shop Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Shop Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Shop Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    value={editForm.contact}
                    onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control 
                    type="url" 
                    value={editForm.website}
                    onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3">Opening Hours</h5>
            {Object.entries(editForm.hours).map(([day, hours]) => (
              <Row key={day} className="mb-2">
                <Col sm={3}>
                  <Form.Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Form.Label>
                </Col>
                <Col sm={9}>
                  <Form.Control 
                    type="text" 
                    value={hours}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      hours: {...editForm.hours, [day]: e.target.value}
                    })}
                  />
                </Col>
              </Row>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyShop;