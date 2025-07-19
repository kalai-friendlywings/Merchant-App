import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FaBell, FaUserCircle, FaSignOutAlt, FaBox, FaMapMarkedAlt,
  FaShoppingBag, FaBars, FaTimes, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa'; // Added FaCheckCircle, FaExclamationCircle
import { MdDashboard } from 'react-icons/md';
import { Dropdown } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import api from '../../services/api';
import './Home.css'; // Ensure this path is correct for our new CSS
// import 'react-toastify/dist/React-Toastify.css';

const Home = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchToast = (msg, type = 'success') => {
        toast[type](msg);
      };
    }
  }, []);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        const response = await api.get('/auth/me/');
        setMerchant({
          name: response.data.full_name,
          email: response.data.email,
        });
      } catch (error) {
        console.error('Error fetching merchant data:', error);
      }
    };

    fetchMerchantData();
  }, []);

  const fetchUnreadNotificationCount = async () => {
    try {
      const response = await api.get('/notifications/unread_count/');
      setUnreadNotificationCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnreadNotificationCount();
    const interval = setInterval(fetchUnreadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationBellClick = () => {
    fetchNotifications();
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_as_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read.');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotificationCount(0);
      toast.success('All notifications marked as read.');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read.');
    }
  };


  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 position-relative">
      {/* Mobile Sidebar Toggle */}
      <div className="d-md-none bg-primary text-white p-3 d-flex justify-content-between align-items-center">
        <span className="fw-bold">MerchantApp</span>
        <FaBars size={20} onClick={() => setShowSidebar(!showSidebar)} />
      </div>

      {/* Sidebar */}
      <div className={`sidebar bg-primary text-white p-3 ${showSidebar ? 'active' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <FaShoppingBag size={28} className="me-2" />
            <span className="fw-bold">MerchantApp</span>
          </div>
          <FaTimes className="d-md-none" onClick={() => setShowSidebar(false)} />
        </div>
        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <Link to="/dashboard" className="nav-link text-white" onClick={() => setShowSidebar(false)}>
              <MdDashboard className="me-2" /> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/dashboard/products" className="nav-link text-white" onClick={() => setShowSidebar(false)}>
              <FaBox className="me-2" /> Products
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/dashboard/profile" className="nav-link text-white" onClick={() => setShowSidebar(false)}>
              <FaUserCircle className="me-2" /> Profile
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/dashboard/pickups" className="nav-link text-white" onClick={() => setShowSidebar(false)}>
              <FaMapMarkedAlt className="me-2" /> Pickups
            </Link>
          </li>
          <li className="nav-item mt-auto">
            <Link to="/logout" className="nav-link text-white" onClick={() => setShowSidebar(false)}>
              <FaSignOutAlt className="me-2" /> Logout
            </Link>
          </li>
        </ul>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Topbar Header */}
        <header className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0">Good Morning, {merchant?.name || 'Merchant'}</h6>
            <small className="text-muted">Last login: Today at 09:42 AM</small>
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* Notifications Dropdown */}
            <Dropdown show={showNotificationsDropdown} onToggle={setShowNotificationsDropdown} align="end">
              <Dropdown.Toggle as="div" id="dropdown-notifications" onClick={handleNotificationBellClick} className="notification-bell-toggle">
                <div className="position-relative">
                  <FaBell size={20} className="text-gray-700 hover:text-gray-900 transition-colors duration-200" />
                  {unreadNotificationCount > 0 && (
                    <span className="notification-badge">
                      {unreadNotificationCount}
                    </span>
                  )}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="notification-dropdown-menu">
                <Dropdown.Header className="notification-header">
                  <strong className="flex items-center justify-between w-full">
                    Notifications
                    {unreadNotificationCount > 0 && (
                      <span className="notification-count-badge">{unreadNotificationCount} unread</span>
                    )}
                  </strong>
                </Dropdown.Header>
                <Dropdown.Divider />
                {notifications.length === 0 ? (
                  <Dropdown.ItemText className="text-center py-3 text-gray-500">No notifications.</Dropdown.ItemText>
                ) : (
                  <>
                    {notifications.map(notification => (
                      <Dropdown.Item 
                        key={notification.id} 
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`notification-item ${notification.is_read ? 'notification-item-read' : 'notification-item-unread'}`}
                      >
                        <div className="notification-content">
                          <div className="notification-icon">
                            {notification.message.includes('approved') ? <FaCheckCircle className="text-green-500" /> : <FaExclamationCircle className="text-blue-500" />}
                          </div>
                          <div className="notification-text">
                            <div className="notification-message">
                               {notification.message}
                            </div>
                            <small className="notification-timestamp">{new Date(notification.created_at).toLocaleString()}</small>
                          </div>
                        </div>
                      </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={markAllNotificationsAsRead} className="notification-mark-all-read-btn">
                      Mark all as read
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>


            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="text-dark p-0 border-0 shadow-none">
                <FaUserCircle size={28} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>
                  <strong>{merchant?.name || 'Merchant Name'}</strong>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {merchant?.email || 'merchant@email.com'}
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/dashboard/profile">Edit Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/logout')}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Home;
