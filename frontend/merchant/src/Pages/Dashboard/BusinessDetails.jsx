import React from 'react';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';

const BusinessDetails = () => {
  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Business Details</h4>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="businessName">
                  <Form.Label>Business Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter business name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="businessType">
                  <Form.Label>Business Type</Form.Label>
                  <Form.Control type="text" placeholder="Retail / Wholesale / Other" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="regNumber">
                  <Form.Label>Registration Number</Form.Label>
                  <Form.Control type="text" placeholder="Enter registration number" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="gstNumber">
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control type="text" placeholder="Enter GST number" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="businessDescription" className="mb-3">
              <Form.Label>Business Description</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Describe your business..." />
            </Form.Group>

            <Button variant="primary" type="submit">
              Save Details
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BusinessDetails;
