import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router";
import { http } from "../../helpers/http";
import PublicNavbar from "../../components/PublicNavbar";
import { Container, Row, Col, Image, Spinner, Alert, Button, Card } from 'react-bootstrap';
import { Heart } from "react-bootstrap-icons";
import TryOn from "../../components/Tryon";

export default function DetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTryOn, setShowTryOn] = useState(false);

    const handleShowTryOn = () => setShowTryOn(true)
    const handleCloseTryOn = () => setShowTryOn(false)

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await http({
                    method: 'GET',
                    url: '/products/' + id,
                })

                setProduct(response.data)
            } catch (error) {
                setError('Failed to load product details.');
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct();
    }, [id])

    const renderContent = () => {
        if (isLoading) {
            return (
                <Container className="text-center my-5">
                    <Spinner animation="border" />
                </Container>
            );
        }

        if (error) {
            return (
                <Container className="my-5">
                    <Alert variant="danger">{error}</Alert>
                </Container>
            );
        }

        if (!product) {
            return (
                <Container className="my-5">
                    <Alert variant="warning">Product not found.</Alert>
                </Container>
            );
        }

        return (
            <Container className="my-5">
                <Row>
                    <Col md={6}>
                        <Image src={product.imageUrl} alt={product.name} fluid />
                    </Col>
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <Card.Title as="h1">{product.name}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted h4">
                                    Rp {product.price?.toLocaleString('id-ID')}
                                </Card.Subtitle>
                                <Card.Text className="mt-4">
                                    {product.description}
                                </Card.Text>

                                <div className="d-grid gap-2 mt-3">
                                    <Button variant="dark" size="lg">
                                        Add to Cart
                                    </Button>
                                    <Button variant="outline-dark" size="lg" onClick={handleShowTryOn}>
                                        Try On
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    };

    return (
        <>
            <PublicNavbar />
            {renderContent()}

            {product && (
                <TryOn
                    show={showTryOn}
                    handleClose={handleCloseTryOn}
                    productId={id}
                    productName={product.name}
                />
            )}
        </>
    )
}