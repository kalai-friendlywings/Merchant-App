// Pages/Dashboard/DashboardLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';



const DashboardLayout = () => {

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={3} className="bg-light vh-100 p-4">
          <h5 className="mb-4">Dashboard</h5>
          <Nav className="flex-column">
           
            <NavLink to="/dashboard/products" className="nav-link">Products</NavLink>
            <NavLink to="/dashboard/profile" className="nav-link">Profile</NavLink>
            <NavLink to="/dashboard/pickups" className="nav-link">Pickups</NavLink>
          </Nav>
        </Col>

        {/* Page Content */}
        <Col md={9} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardLayout;
