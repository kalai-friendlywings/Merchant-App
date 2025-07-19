// App.jsx
import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from 'react-router-dom';
import axios from 'axios';

// Auth Cleanup
import { cleanupAuth } from './utils/auth';

// ✅ Public Pages
import MerchantHome from './Pages/MerchantHome.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';

// ✅ Onboarding Pages
import MerchantReg from './Pages/MerchantReg.jsx';
import MerchantDetails from './Pages/MerchantDetails.jsx';

// ✅ Dashboard Wrapper
import Home from './Pages/Dashboard/Home.jsx';
import DashboardHome from './Pages/Dashboard/DashboardHome.jsx';
import Logout from './Pages/Dashboard/Logout.jsx';

// ✅ Dashboard Profile Related
import Profile from './Pages/Dashboard/Profile.jsx';
import EditProfile from './Pages/Dashboard/EditProfile.jsx';
import ProfileOverview from './Pages/Dashboard/ProfileOverview.jsx';

// ✅ Other Dashboard Pages
import Pickups from './Pages/Dashboard/Pickups.jsx';

// ✅ Products Module
import ProductsPage from './Pages/Dashboard/Products/ProductsPage.jsx';
import AllProducts from './Pages/Dashboard/Products/AllProducts.jsx';
import SmartAddProduct from './Pages/Dashboard/Products/SmartAddProduct.jsx';
import ExcelUpload from './Pages/Dashboard/Products/ExcelUpload.jsx';

// 🔐 Protected Route Wrapper
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ✅ Clean up corrupted tokens if needed
cleanupAuth();

function AppWrapper() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (location.pathname === '/logout') {
      setCheckingAuth(false);
      return;
    }

    if (!token) {
      if (!['/', '/login', '/register'].includes(location.pathname)) {
        navigate('/login', { replace: true });
      }
      setCheckingAuth(false);
      return;
    }

    axios
      .get('http://localhost:8000/api/merchant/onboarding-status/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const onboarded = res.data.is_onboarded;
        localStorage.setItem('is_onboarded', onboarded);

        if (onboarded) {
          if (
            ['/', '/login', '/register'].includes(location.pathname) ||
            location.pathname.startsWith('/merchant/business')
          ) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          if (!location.pathname.startsWith('/merchant/business')) {
            navigate('/merchant/business', { replace: true });
          }
        }
      })
      .catch((err) => {
        console.warn("Auth check failed:", err?.response?.data || err.message);
        localStorage.clear();
        if (!['/', '/login', '/register'].includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      })
      .finally(() => setCheckingAuth(false));
  }, [location, navigate]);

  if (checkingAuth) {
    return <div className="text-center p-5">Checking authentication...</div>;
  }

  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<MerchantHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />

      {/* 🧾 Onboarding Routes */}
      <Route
        path="/merchant/business"
        element={
          <RequireAuth>
            <MerchantReg />
          </RequireAuth>
        }
      />
      <Route
        path="/merchant/business/details"
        element={
          <RequireAuth>
            <MerchantDetails />
          </RequireAuth>
        }
      />

      {/* 🧭 Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="profile-overview" element={<ProfileOverview />} />
        <Route path="pickups" element={<Pickups />} />

        {/* 📦 Products Nested Routes */}
        <Route path="products" element={<ProductsPage />}>
          <Route index element={<AllProducts />} />
          <Route path="smart-add" element={<SmartAddProduct />} />
          <Route path="excel-upload" element={<ExcelUpload />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<div className="text-center p-5">Page Not Found</div>} />
    </Routes>
  );
}

export default AppWrapper;
