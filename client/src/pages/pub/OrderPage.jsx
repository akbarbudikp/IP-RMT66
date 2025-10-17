import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Spinner, Alert, Image, Row, Col } from 'react-bootstrap';
import { http } from '../../helpers/http';
import PublicNavbar from '../../components/PublicNavbar';

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
});

const statusVariantMap = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'danger',
    shipped: 'info'
};

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await http({
                    method: 'GET',
                    url: '/orders',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                })

                setOrders(response.data);
            } catch (err) {
                setError('Gagal memuat riwayat pesanan.');
                console.error("Fetch orders error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    if (loading) return <div className="text-center my-5"><Spinner /></div>;
    if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <>
            <PublicNavbar />
            <Container className="my-5">
                <h1 className="page-title">Order History</h1>
                {orders.length === 0 ? (
                    <Alert variant="info">You haven't placed any orders yet.</Alert>
                ) : (
                    orders.map(order => (
                        <Card key={order.id} className="mb-4 order-card">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-bold">Order ID:</span> #{order.id}
                                    <span className="mx-3 text-muted">|</span>
                                    <span className="fw-bold">Date:</span> {formatDate(order.createdAt)}
                                </div>
                                <Badge bg={statusVariantMap[order.status] || 'secondary'} className="order-status">
                                    {order.status}
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                {order.items.map(item => (
                                    <Row key={item.id} className="align-items-center my-3 order-item-row">
                                        <Col xs={2} md={1}>
                                            <Image src={item.product.imageUrl} fluid rounded />
                                        </Col>
                                        <Col xs={6} md={7}>
                                            <div className="fw-bold">{item.product.name}</div>
                                            <div className="text-muted small">
                                                {item.quantity} x {formatRupiah(item.priceAtPurchase)}
                                            </div>
                                        </Col>
                                        <Col xs={4} md={4} className="text-end fw-semibold">
                                            {formatRupiah(item.quantity * item.priceAtPurchase)}
                                        </Col>
                                    </Row>
                                ))}
                            </Card.Body>
                            <Card.Footer className="text-end">
                                <span className="fw-bold h5">Total: {formatRupiah(order.totalPrice)}</span>
                            </Card.Footer>
                        </Card>
                    ))
                )}
            </Container>
        </>
    );
}