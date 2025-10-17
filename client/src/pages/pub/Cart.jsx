import { http } from "../../helpers/http";
import { useEffect } from "react";
import { Container, Row, Col, Card, Button, Image, Spinner, Alert } from 'react-bootstrap';
import PublicNavbar from "../../components/PublicNavbar";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useReducer } from "react";

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

const initialState = {
    cart: null,
    loading: true,
    error: null
};

function cartReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, cart: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            throw new Error();
    }
}

export default function Cart() {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { cart, loading, error } = state;
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('Anda harus login untuk melihat halaman ini.');
            navigate('/login');
        }
    }, [navigate]);

    const fetchCart = useCallback(async () => {
        dispatch({ type: 'FETCH_START' }); 
        try {
            const response = await http({
                method: 'GET',
                url: '/carts',
                headers: {  
                    Authorization: 'Bearer ' + localStorage.getItem('access_token')
                }
            });
            const cartData = response.data;
            if (cartData && !cartData.subtotal) {
                cartData.subtotal = cartData.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                cartData.totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
            }
            dispatch({ type: 'FETCH_SUCCESS', payload: cartData }); 
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', payload: 'Gagal memuat keranjang.' }); 
        }
    }, []);
    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            fetchCart();
        }
    }, [fetchCart])

    const handleRemoveItem = async (cartItemId) => {
        try {
            const response = await http({
                method: 'DELETE',
                url: '/carts/' + cartItemId,
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token')
                }
            })

            fetchCart();
        } catch (error) {
            alert('Gagal menghapus item dari keranjang.');
            console.error("Remove item error:", error);
        }
    }

    if (loading) {
        return <div className="text-center my-5 vh-100"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <>
                <PublicNavbar />
                <Container className="text-center my-5 py-5">
                    <h1 className="cart-title">BAG</h1>
                    <p className="lead text-muted">There are no items in your bag.</p>
                    <Button variant="dark" className="rounded-pill px-4 mt-3" href="/">Continue Shopping</Button>
                </Container>
            </>
        );
    }

    if (!localStorage.getItem('access_token')) {
        return null;
    }

    return (
        <>
            <PublicNavbar />
            <Container fluid="lg" className="my-4">
                <Row>
                    <Col lg={8}>
                        <h1 className="cart-title">BAG ({cart.totalItems})</h1>
                        {cart.items.map(item => (
                            <Row key={item.id} className="cart-item-row">
                                <Col xs={4} md={3}>
                                    <Image src={item.product.imageUrl || 'https://via.placeholder.com/300'} fluid />
                                </Col>
                                <Col xs={8} md={9}>
                                    <div className="d-flex justify-content-between">
                                        <h5 className="item-name">{item.product.name}</h5>
                                        <h5 className="item-price">{formatRupiah(item.product.price * item.quantity)}</h5>
                                    </div>
                                    <p className="item-category text-muted">{item.product.category || 'Category'}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <span className="text-muted">Qty: {item.quantity}</span>
                                        <Button variant="link" className="remove-link" onClick={() => handleRemoveItem(item.id)}>
                                            Remove
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        ))}
                    </Col>

                    <Col lg={4}>
                        <h1 className="summary-title">SUMMARY</h1>
                        <Card className="summary-card border-0">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between">
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(cart.subtotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span>Estimated Shipping</span>
                                    <span>Free</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold h5">
                                    <span>Total</span>
                                    <span>{formatRupiah(cart.subtotal)}</span>
                                </div>
                                <hr />
                                <div className="d-grid gap-2 mt-4">
                                    <Link to='/checkout'>
                                        <Button variant="dark" className="btn-checkout">
                                            Checkout
                                        </Button>
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}