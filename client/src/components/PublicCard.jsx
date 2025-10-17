import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useEffect } from "react";
import { http } from "../helpers/http";
import { useState } from 'react';
import { Link } from 'react-router';

export default function PublicCard() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await http({
                    method: 'GET',
                    url: '/products',
                })

                const data = response.data;
                console.log(data);
                setProducts(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false)
            }
        }
        fetchProducts();
    }, [])

    if (isLoading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
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
                                    {product.description.substring(0, 50)}...
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
    )
}