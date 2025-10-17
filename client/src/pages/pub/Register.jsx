import { useState } from "react";
import { useNavigate } from "react-router";
import PublicNavbar from "../../components/PublicNavbar";
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { http } from "../../helpers/http";

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        console.log("Tombol Register diklik, handleSubmit dijalankan!")
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await http({
                method: 'POST',
                url: '/register',
                data: {
                    fullName,
                    email,
                    password,
                    role
                }
            })

            navigate('/login');

        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.')
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
                        <h2 className="text-center mb-4">Register</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </Form.Group>

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

                            <Form.Group className="mb-3" controlId="formBasicRole">
                                <Form.Label>Role</Form.Label>
                                <Form.Select
                                    aria-label="Select role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih peran Anda</option>
                                    <option value="admin">Admin</option>
                                    <option value="customer">Customer</option>
                                </Form.Select>
                            </Form.Group>

                            <Button variant="dark" type="submit" className="w-100" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Register'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}