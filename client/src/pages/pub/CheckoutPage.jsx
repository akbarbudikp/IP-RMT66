import { useEffect } from "react";
import { useState } from "react";
import { http } from "../../helpers/http";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import PublicNavbar from "../../components/PublicNavbar";
import { useNavigate } from "react-router";

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

export default function CheckoutPage() {
    const [cart, setCart] = useState(null);
    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchCart() {
            try {
                const response = await http({
                    method: 'GET',
                    url: '/carts',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                })

                if (!response.data || response.data.items.length === 0) {
                    navigate('/carts');
                }
                const cartData = response.data;
                cartData.subtotal = cartData.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

                setCart(cartData);
            } catch (error) {
                setError('Failed to load cart. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchCart()
    }, [navigate])

    const handleCheckout = async () => {
        if (!shippingAddress.trim()) {
            return setError('Shipping address is required.');
        }
        setProcessing(true);
        setError('');

        try {
            const response = await http({
                method: 'POST',
                url: '/orders/checkout',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                },
                data: {
                    shippingAddress: shippingAddress
                }
            })
            const { snapToken } = response.data;

            window.snap.pay(snapToken, {
                onSuccess: (result) => {
                    console.log('Payment success:', result);
                    alert("Pembayaran berhasil!");
                    navigate('/orders');
                },
                onPending: (result) => {
                    console.log('Payment pending:', result);
                    alert("Menunggu pembayaran Anda.");
                    navigate('/orders');
                },
                onError: (result) => {
                    console.error('Payment error:', result);
                    setError("Pembayaran gagal atau dibatalkan.");
                },
                onClose: () => {
                    console.log('Anda menutup popup tanpa menyelesaikan pembayaran');
                }
            });
        } catch (err) {
            console.error("Checkout process error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Terjadi kesalahan saat memproses checkout.');
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center my-5"><Spinner /></div>;

    return (
        <>
            <PublicNavbar />
            <Container className="my-5">
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                <Row>
                    <Col md={7}>
                        <h1 className="checkout-title">Shipping Address</h1>
                        <Card className="border-0">
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Enter your full shipping address"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={5}>
                        <h1 className="checkout-title">Order Summary</h1>
                        <Card className="border-0 summary-card">
                            {cart ? (
                                <ListGroup variant="flush">
                                    {cart.items.map(item => (
                                        <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                                            <span>{item.product.name} (x{item.quantity})</span>
                                            <span>{formatRupiah(item.product.price * item.quantity)}</span>
                                        </ListGroup.Item>
                                    ))}
                                    <ListGroup.Item className="d-flex justify-content-between fw-bold h5">
                                        <span>Total</span>
                                        <span>{formatRupiah(cart.subtotal)}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            ) : (
                                <p>Loading summary...</p>
                            )}
                            <Card.Body>
                                <Button variant="dark" className="w-100 btn-checkout" onClick={handleCheckout} disabled={processing || loading}>
                                    {processing ? <Spinner size="sm" /> : 'Proceed to Payment'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}