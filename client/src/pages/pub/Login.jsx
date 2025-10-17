import { useState } from "react";
import { useNavigate } from "react-router";
import PublicNavbar from "../../components/PublicNavbar";
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { http } from "../../helpers/http";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await http({
                method: 'POST',
                url: '/login',
                data: {
                    email,
                    password,
                }
            })

            const accessToken = response.data.access_token;

            localStorage.setItem('access_token', accessToken);
            
            navigate('/');

        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <>
            <PublicNavbar />
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <Card style={{ width: '25rem' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Login</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button variant="dark" type="submit" className="w-100" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Login'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}