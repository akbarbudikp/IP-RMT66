import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';

export default function PublicCard() {
    const dispatch = useDispatch();

    const { data: products, loading, error } = useSelector(state => state.product);

    useEffect(() => {
        if (loading === 'idle') {
            dispatch(fetchProducts());
        }
    }, [loading, dispatch]);

    if (loading === 'pending') {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (loading === 'failed' && error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    Failed to load products: {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4 fw-bold">New Arrivals</h2>
            <Row>
                {products.map(product => (
                    <Col md={4} key={product.id} className="mb-4">
                        <Card className="product-card h-100">
                            <Card.Img
                                variant="top"
                                src={product.imageUrl}
                                alt={product.name}
                                style={{ imageFit: 'cover', height: '200px', objectFit: 'cover' }}
                            />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title className="fw-bold">{product.name}</Card.Title>
                                <Card.Text>
                                    {product.description?.substring(0, 50)}...
                                </Card.Text>
                                <Link to={`/products/${product.id}`} className="mt-auto">
                                    <Button variant="dark" className="w-100">
                                        View Details
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}