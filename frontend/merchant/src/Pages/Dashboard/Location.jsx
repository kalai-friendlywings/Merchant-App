import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const Location = () => {
  return (
    <div className="p-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="mb-4">Business Location</h4>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control type="text" placeholder="Enter your city" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pincode</Form.Label>
              <Form.Control type="text" placeholder="Enter pincode" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Latitude</Form.Label>
              <Form.Control type="text" placeholder="Latitude" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Longitude</Form.Label>
              <Form.Control type="text" placeholder="Longitude" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Location
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Location;
