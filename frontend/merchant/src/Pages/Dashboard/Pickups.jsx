import React from 'react';
import { Card, Container, Table, Badge } from 'react-bootstrap';

const pickupData = [
  { id: 1, customer: 'Arun Kumar', product: 'Wireless Mouse', date: '2025-05-06', status: 'Scheduled' },
  { id: 2, customer: 'Divya R', product: 'Laptop Stand', date: '2025-05-07', status: 'Pending' },
  { id: 3, customer: 'Karthik M', product: 'USB-C Charger', date: '2025-05-07', status: 'Completed' },
];

const statusVariant = {
  Scheduled: 'info',
  Pending: 'warning',
  Completed: 'success',
};

const Pickups = () => {
  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Scheduled Pickups</h4>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover className="align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Pickup Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pickupData.map((pickup, index) => (
                <tr key={pickup.id || index}>
                  <td>{pickup.id}</td>
                  <td>{pickup.customer}</td>
                  <td>{pickup.product}</td>
                  <td>{pickup.date}</td>
                  <td>
                    <Badge bg={statusVariant[pickup.status] || 'secondary'}>
                      {pickup.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Pickups;
