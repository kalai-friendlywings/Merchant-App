import React from "react";
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Needed for navbar toggler

import '../merchantHome.css';
import merchantImage from '../assets/Merchant-img.png';

const MerchantHome = () => {
  const navigate = useNavigate();

  const steps = [
    { step: 1, title: "Register", desc: "Create your merchant account and set up your shop profile in minutes." },
    { step: 2, title: "List Products", desc: "Add your items with prices, images, and stock details to get started." },
    { step: 3, title: "Start Selling", desc: "Receive orders, manage pickup requests, and track sales in one dashboard." }
  ];

  const quickLinks = [

  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand text-primary fw-bold fs-4" to="/">MyMerchant</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {quickLinks.map((link, index) => (
                <li className="nav-item" key={index}>
                  <Link className="nav-link fw-medium" to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary ms-lg-3 mt-2 mt-lg-0"onClick={() => navigate('/Login')}>Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-5">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <img src={merchantImage} alt="Merchant interacting with customer" className="animated-merchant w-100" />
          </div>
          <div className="col-md-6">
            <h1 className="display-5 fw-bold">
              <span className="text-primary">Stand out</span> on Local Pickup with your Merchant Profile
            </h1>
            <p className="lead mt-3">
              Turn customers into regulars by creating a merchant profile that promotes your business,
              products, and services. Let local shoppers discover you with ease.
            </p>
            <button className="btn btn-primary btn-lg mt-4" onClick={() => navigate('/merchant/business')}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container py-4">
        <div className="row text-center">
          {steps.map(({ step, title, desc }) => (
            <div className="col-md-4 mb-4" key={step}>
              <div className="display-4 text-primary fw-semibold mb-2">{step}</div>
              <h5 className="fw-bold mb-2">{title}</h5>
              <p className="text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white pt-5 pb-4 mt-5">
        <div className="container text-center text-md-left">
          <div className="row text-center text-md-left">
            <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 font-weight-bold text-warning">MyMerchant</h5>
              <p>
                Empowering local businesses by connecting them to nearby customers through fast, reliable pickup solutions.
              </p>
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Quick Links</h5>
              {quickLinks.map((link, index) => (
                <p key={index}><Link to={link.to} className="text-white text-decoration-none">{link.label}</Link></p>
              ))}
            </div>

            <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Support</h5>
              <p><i className="bi bi-envelope me-2"></i> support@mymerchant.com</p>
              <p><i className="bi bi-phone me-2"></i> +91 98765 43210</p>
              <p><i className="bi bi-geo-alt me-2"></i> Ramanathapuram, TN</p>
            </div>

            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Follow Us</h5>
              <a href="#" className="text-white me-4"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white me-4"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white me-4"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-white"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <hr className="my-4" />
          <div className="row align-items-center">
            <div className="col-md-7 col-lg-8">
              <p>© {new Date().getFullYear()} <strong>MyMerchant</strong> — All rights reserved.</p>
            </div>
            <div className="col-md-5 col-lg-4">
              <p className="text-end">Built with ❤️ in Ramnad</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MerchantHome;
