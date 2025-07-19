// Pages/Dashboard/Logout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cleanupAuth } from '../../utils/auth';
import { toast, ToastContainer } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info('Logging out...', {
      position: 'top-center',
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    });

    // Clear everything
    cleanupAuth();
    localStorage.clear();
    sessionStorage.clear();

    // Redirect after toast
    setTimeout(() => {
      navigate('/', { replace: true });
      window.location.reload(); // Optional: ensures full cleanup
    }, 1200);
  }, [navigate]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="spinner-border text-info mb-3" role="status">
        <span className="visually-hidden">Logging out...</span>
      </div>
      <h5 className="text-muted">Logging you out...</h5>
      <ToastContainer />
    </div>
  );
};

export default Logout;
