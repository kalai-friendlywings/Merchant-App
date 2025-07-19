import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // For icons
import '../Products/Product.css'


const ProductsPage = () => {
  const location = useLocation();

  return (
    <div className="container-fluid py-4">
      <div className="px-lg-5">
        <h2>Product Management</h2>
        <nav className="products-nav nav nav-tabs border-0 mb-4">
          <Link 
            to="" 
            className={`nav-link ${location.pathname.endsWith('/products') || location.pathname.endsWith('/products/') ? 'active' : ''}`}
          >
            <i className="bi bi-grid me-2"></i> All Products
          </Link>
          <Link 
            to="smart-add" 
            className={`nav-link ${location.pathname.includes('smart-add') ? 'active' : ''}`}
          >
            <i className="bi bi-magic me-2"></i> Smart Add
          </Link>
          
        </nav>

        <div className="bg-white rounded-4 shadow-sm p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;