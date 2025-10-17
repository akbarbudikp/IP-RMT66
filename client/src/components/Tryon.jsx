import { Modal, Button, Image, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { http } from '../helpers/http';
import { useState, useEffect } from "react";

const TryOn = ({ show, handleClose, productId, productName }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [userHeight, setHeight] = useState('');
    const [userWeight, setWeight] = useState('');
    const [productSize, setProductSize] = useState('L');

    const [generatedImage, setGeneratedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setGeneratedImage(null);
            setError(null);
        }
    }

    const handleGenerateTryOn = async () => {
        if (!selectedFile || !userHeight || !userWeight || !productSize) {
            setError('Please fill all fields and upload an image.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        const formData = new FormData();
        formData.append('userImage', selectedFile);
        formData.append('height', userHeight);
        formData.append('weight', userWeight);
        formData.append('product_size', productSize);

        try {
            const response = await http({
                method: 'POST',
                url: `/products/${productId}/virtual-try-on`,
                data: formData,
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data' 
                }
            })

            setGeneratedImage(response.data.resultUrl);

        } catch (error) {
            setError('Failed to generate image. Please ensure you upload a clear, front-facing photo.');
        } finally {
            setIsLoading(false);
        }
    }

    const resetAndClose = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        setHeight('');
        setWeight('');
        setProductSize('L');
        setGeneratedImage(null);
        setError(null);
        setIsLoading(false);
        handleClose();
    }

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        }
    }, [previewImage])

    return (
        <Modal show={show} onHide={resetAndClose} size='lg' centered>
            <Modal.Header closeButton>
                <Modal.Title>Virtual Try-On: {productName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <div className='text-center my-5'>
                        <Spinner animation="border" />
                        <p className="mt-2">Generating your try on, this may take a moment...</p>
                    </div>
                ) : generatedImage ? (
                    <div className="text-center">
                        <h5>Here's your result!</h5>
                        <Image src={generatedImage} fluid alt={`Try on result for ${productName}`} />
                    </div>
                ) : (
                    <Form>
                        <Form.Group controlId="userImageFile" className="mb-3">
                            <Form.Label>1. Upload Your Photo</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                            />
                        </Form.Group>
                        {previewImage && <Image src={previewImage} thumbnail fluid className="mb-3 mx-auto d-block" style={{ maxHeight: '200px' }} />}

                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="userHeight" className="mb-3">
                                    <Form.Label>2. Height (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="e.g., 175"
                                        value={userHeight}
                                        onChange={(e) => setHeight(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="userWeight" className="mb-3">
                                    <Form.Label>3. Weight (kg)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="e.g., 70"
                                        value={userWeight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="productSize" className="mb-3">
                                    <Form.Label>4. Product Size</Form.Label>
                                    <Form.Select
                                        value={productSize}
                                        onChange={(e) => setProductSize(e.target.value)}
                                    >
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                )}

                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Modal.Body>
            <Modal.Footer>
                {generatedImage && isLoading && (
                    <Button variant="secondary" onClick={resetAndClose}>
                        Close
                    </Button>
                )}
                <Button
                    variant="dark"
                    onClick={handleGenerateTryOn}
                    disabled={!selectedFile || !userHeight || !userWeight || !productSize || isLoading}
                >
                    {isLoading ? 'Generating...' : (generatedImage ? 'Generate Again' : 'Generate Try On')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default TryOn;