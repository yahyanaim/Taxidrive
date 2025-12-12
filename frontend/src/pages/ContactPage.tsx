import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm';

export default function ContactPage() {
  return (
    <div className="page">
      <header>
        <div className="container">
          <nav className="nav">
            <h1 className="nav-title">Wingy's</h1>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero-section">
          <h1 className="page-title">Get in Touch</h1>
          <p className="page-subtitle">
            We'd love to hear from you
          </p>
        </section>

        <div className="contact-layout">
          <div className="contact-info-section">
            <div className="map-container">
              <div className="map-placeholder" role="img" aria-label="Restaurant location map">
                <div className="map-pin">📍</div>
                <p className="map-label">Wingy's Location</p>
                <p className="map-address">123 Flavor Street, Food District</p>
              </div>
            </div>

            <div className="contact-details">
              <h2 className="section-title">Visit Us</h2>
              
              <div className="contact-info-block">
                <h3 className="contact-info-heading">Address</h3>
                <address className="contact-info-text">
                  123 Flavor Street<br />
                  Food District, Downtown<br />
                  City, State 12345
                </address>
              </div>

              <div className="contact-info-block">
                <h3 className="contact-info-heading">Phone</h3>
                <p className="contact-info-text">
                  <a href="tel:+15551234567" className="contact-link">
                    (555) 123-4567
                  </a>
                </p>
              </div>

              <div className="contact-info-block">
                <h3 className="contact-info-heading">Email</h3>
                <p className="contact-info-text">
                  <a href="mailto:hello@wingys.com" className="contact-link">
                    hello@wingys.com
                  </a>
                </p>
              </div>

              <div className="contact-info-block">
                <h3 className="contact-info-heading">Operating Hours</h3>
                <ul className="hours-list">
                  <li className="hours-item">
                    <span className="hours-day">Monday - Thursday</span>
                    <span className="hours-time">11:00 AM - 10:00 PM</span>
                  </li>
                  <li className="hours-item">
                    <span className="hours-day">Friday - Saturday</span>
                    <span className="hours-time">11:00 AM - 11:00 PM</span>
                  </li>
                  <li className="hours-item">
                    <span className="hours-day">Sunday</span>
                    <span className="hours-time">12:00 PM - 9:00 PM</span>
                  </li>
                </ul>
              </div>

              <div className="contact-info-block">
                <h3 className="contact-info-heading">Follow Us</h3>
                <div className="social-links">
                  <a 
                    href="https://facebook.com/wingys" 
                    className="social-link" 
                    aria-label="Visit our Facebook page"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                  <a 
                    href="https://instagram.com/wingys" 
                    className="social-link" 
                    aria-label="Visit our Instagram page"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                  <a 
                    href="https://twitter.com/wingys" 
                    className="social-link" 
                    aria-label="Visit our Twitter page"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <ContactForm />
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Wingy's</h3>
              <p>Authentic flavors, warm hospitality</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <p>&copy; 2024 Wingy's. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
