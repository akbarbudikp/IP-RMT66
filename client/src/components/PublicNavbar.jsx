import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Search, Heart, Bag, PersonCircle, Receipt, BoxArrowRight } from 'react-bootstrap-icons';
import './PublicNavbar.css';
import { Link, useNavigate } from 'react-router';

export default function PublicNavbar() {
  const navigate = useNavigate()
  
  async function onLogout() {
    localStorage.removeItem('access_token');

    navigate('/login')
  }
  return (
    <Navbar expand="lg" className="bg-white shadow-sm mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">NUKE</Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link className="fw-medium">Kemeja</Nav.Link>
            <Nav.Link href="#kaos"className="fw-medium">Kaos</Nav.Link>
            <Nav.Link href="#jaket" className="fw-medium">Jaket</Nav.Link>
            <Nav.Link href="#celana" className="fw-medium">Celana</Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/orders" className="d-flex align-items-center me-2">
              <Receipt size={20} />
            </Nav.Link>
            <Nav.Link as={Link} to="/carts" className="d-flex align-items-center me-3">
              <Bag size={20} />
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="d-flex align-items-center">
              <PersonCircle size={24} />
            </Nav.Link>
            <Nav.Link onClick={onLogout} className="d-flex align-items-center me-2">
              <BoxArrowRight size={20} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}