import React, { useRef, useState, useEffect } from 'react';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { Spinner } from 'react-bootstrap';
import './ProfileBanner.css';

const ProfileBanner = ({
  bannerImage,
  profileImage,
  name,
  welcomeText,
  onBannerChange,
  onProfileChange,
}) => {
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const [showBannerControls, setShowBannerControls] = useState(false);
  const [showProfileControls, setShowProfileControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerBannerUpload = () => bannerInputRef.current.click();
  const triggerProfileUpload = () => profileInputRef.current.click();

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onBannerChange(file);
    e.target.value = null;
    setShowBannerControls(false);
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onProfileChange(file);
    e.target.value = null;
    setShowProfileControls(false);
  };

  const handleBannerAction = (action) => {
    if (action === 'DELETE') onBannerChange('DELETE');
    setShowBannerControls(false);
  };

  const handleProfileAction = (action) => {
    if (action === 'DELETE') onProfileChange('DELETE');
    setShowProfileControls(false);
  };

  // Mobile specific toggle for profile controls
  const toggleProfileControls = () => {
    if (isMobile) { // Only toggle on click if it's mobile
      setShowProfileControls(!showProfileControls);
      setShowBannerControls(false);
    }
  };

  // Mobile specific toggle for banner controls
  const toggleBannerControls = () => {
    if (isMobile) { // Only toggle on click if it's mobile
      setShowBannerControls(!showBannerControls);
      setShowProfileControls(false);
    }
  };

  return (
    <div className="profile-banner-container">
      {/* Banner Section */}
      <div 
        className="banner-image-wrapper"
        onMouseEnter={() => !isMobile && setShowBannerControls(true)}
        onMouseLeave={() => !isMobile && setShowBannerControls(false)}
        onClick={isMobile ? toggleBannerControls : undefined}
      >
        {bannerImage === 'loading' ? (
          <div className="banner-loading-spinner">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : bannerImage ? (
          <img src={bannerImage} alt="Banner" className="banner-image" />
        ) : (
          <div className="banner-placeholder">
            <div className="gradient-overlay"></div>
            <span>Upload Banner Image</span>
          </div>
        )}

        {/* Banner Controls */}
        {isMobile ? (
          <>
            <button 
              className={`banner-btn mobile-upload-btn ${showBannerControls ? 'visible' : ''}`}
              onClick={triggerBannerUpload}
              aria-label="Change banner image"
            >
              <FiCamera />
            </button>
            {bannerImage && bannerImage !== 'loading' && (
              <button 
                className={`banner-btn mobile-delete-btn ${showBannerControls ? 'visible' : ''}`}
                onClick={() => handleBannerAction('DELETE')}
                aria-label="Remove banner image"
              >
                <FiTrash2 />
              </button>
            )}
          </>
        ) : (
          <div className={`banner-controls ${showBannerControls ? 'visible' : ''}`}>
            <button 
              className="banner-btn upload-btn"
              onClick={triggerBannerUpload}
              aria-label="Change banner image"
            >
              <FiCamera />
            </button>
            {bannerImage && bannerImage !== 'loading' && (
              <button 
                className="banner-btn delete-btn"
                onClick={() => handleBannerAction('DELETE')}
                aria-label="Remove banner image"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={bannerInputRef}
          onChange={handleBannerFileChange}
          className="d-none"
        />
      </div>

      {/* Profile Details Section */}
      <div className="profile-details">
        {/* Apply hover events to profile-pic-container */}
        <div 
          className="profile-pic-container"
          onMouseEnter={() => !isMobile && setShowProfileControls(true)}
          onMouseLeave={() => !isMobile && setShowProfileControls(false)}
        >
          <div 
            className="profile-pic-wrapper"
            onClick={toggleProfileControls} // Only for mobile click
          >
            {profileImage === 'loading' ? (
              <div className="profile-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">
                {name ? name.charAt(0).toUpperCase() : 'AV'}
              </div>
            )}
          </div>
          
          <div className={`profile-pic-controls ${showProfileControls ? 'visible' : ''}`}>
            <button 
              className="profile-control-btn upload-btn"
              onClick={triggerProfileUpload}
              aria-label="Change profile image"
            >
              <FiCamera />
              {!isMobile && <span className="tooltip">Change Photo</span>}
            </button>
            {profileImage && profileImage !== 'loading' && (
              <button 
                className="profile-control-btn delete-btn"
                onClick={() => handleProfileAction('DELETE')}
                aria-label="Remove profile image"
              >
                <FiTrash2 />
                {!isMobile && <span className="tooltip">Remove Photo</span>}
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={profileInputRef}
            onChange={handleProfileFileChange}
            className="d-none"
          />
        </div>

        <div className="profile-text">
          <h4>{name || 'Your Shop'}</h4>
          <p>{welcomeText || 'Welcome! Ready to grow your business today?'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;