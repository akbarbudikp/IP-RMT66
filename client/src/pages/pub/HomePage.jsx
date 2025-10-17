import { Button, Image } from 'react-bootstrap';
import PublicNavbar from "../../components/PublicNavbar";
import bannerImage from '../../assets/Banner.png';
import PublicCard from "../../components/PublicCard";

export default function HomePage() {

    return (
        <>
            <PublicNavbar />

            <div className="hero-section text-white text-center">
                <Image
                    src={bannerImage}
                    alt="Hero banner"
                    fluid
                    className="hero-image"
                />
                <div className="hero-text">
                    <h1 className="display-4 fw-bold">FIND YOUR GREATNESS</h1>
                    <p className="lead">
                        Our new collection is here to help you push your limits.
                    </p>
                    <Button variant="light" size="lg" className="fw-bold">Belanja Sekarang</Button>
                </div>
            </div>

            <PublicCard />
        </>
    )
}