import { useState } from "react";
import { Link, useNavigate } from "react-router";
import PublicNavbar from "../../components/PublicNavbar";
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { http } from "../../helpers/http";
import { useEffect } from "react";
import { useRef } from "react";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    const googleButtonRef = useRef(null);

    async function handleCredentialResponse(response) {
        setIsLoading(true)
        setError(null);
        
        const body = {
            googleToken: response.credential
        }

        const { data } = await http({
            method: 'POST',
            url: '/google-login',
            data: body

        })

        localStorage.setItem('access_token', data.access_token);

        navigate('/')
    }

    useEffect(() => {
        if (window.google && googleButtonRef.current && googleButtonRef.current.childElementCount === 0) {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
                googleButtonRef.current,
                { theme: "outline", size: "large" }
            );
        }
    }, []);

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
                    password
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

                        <Link to="/register" className="d-block text-center mt-3">
                            <p>Belum punya akun? register disini</p>
                        </Link>

                        <div ref={googleButtonRef} className="d-flex justify-content-center mt-3"></div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}