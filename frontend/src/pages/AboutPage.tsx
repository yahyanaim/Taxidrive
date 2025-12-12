import { Link } from 'react-router-dom';
import InfoCard from '../components/InfoCard';

export default function AboutPage() {
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
          <h1 className="page-title">About Wingy's</h1>
          <p className="page-subtitle">
            Where authentic flavors meet warm hospitality
          </p>
        </section>

        <section className="content-section">
          <div className="story-section">
            <h2 className="section-title">Our Story</h2>
            <div className="story-content">
              <p>
                Wingy's began as a dream in a small kitchen, where our founder discovered the perfect 
                blend of spices that would become our signature flavor. What started as a family recipe 
                passed down through generations has grown into a beloved gathering place for food lovers 
                from all walks of life.
              </p>
              <p>
                For over a decade, we've been serving up joy, one wing at a time. Our commitment to 
                quality ingredients, authentic preparation methods, and genuine hospitality has made 
                Wingy's a cornerstone of our community. We believe that great food brings people together, 
                and every meal is an opportunity to create lasting memories.
              </p>
              <p>
                Today, Wingy's continues to honor its roots while embracing innovation. We source locally 
                whenever possible, support our community, and never compromise on the values that built 
                our reputation: quality, authenticity, and heart.
              </p>
            </div>
          </div>

          <div className="values-section">
            <h2 className="section-title">Our Values</h2>
            <div className="grid grid-2">
              <InfoCard
                icon="🌶️"
                title="Authentic Spices"
                description="We use only the finest, hand-selected spices sourced from trusted suppliers around the world. Each blend is crafted with care to deliver bold, unforgettable flavors."
                variant="highlight"
              />
              <InfoCard
                icon="❤️"
                title="Warm Hospitality"
                description="Every guest is family at Wingy's. Our team is dedicated to creating a welcoming atmosphere where you feel at home from the moment you walk through our doors."
                variant="highlight"
              />
              <InfoCard
                icon="🥗"
                title="Fresh Ingredients"
                description="We believe great food starts with great ingredients. We partner with local farms and suppliers to ensure every dish is made with the freshest, highest-quality produce."
                variant="highlight"
              />
              <InfoCard
                icon="🌍"
                title="Community Focus"
                description="We're proud to be part of this community. From supporting local events to partnering with neighborhood organizations, giving back is at the heart of what we do."
                variant="highlight"
              />
            </div>
          </div>

          <div className="team-section">
            <h2 className="section-title">Meet Our Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="team-portrait" role="img" aria-label="Chef Maria Rodriguez portrait placeholder">
                  <div className="portrait-placeholder">MR</div>
                </div>
                <h3 className="team-member-name">Chef Maria Rodriguez</h3>
                <p className="team-member-role">Head Chef & Founder</p>
                <p className="team-member-bio">
                  With 20 years of culinary experience, Chef Maria brings passion and precision to every 
                  dish. Her innovative approach to traditional flavors has earned Wingy's numerous accolades.
                </p>
              </div>

              <div className="team-member">
                <div className="team-portrait" role="img" aria-label="James Chen portrait placeholder">
                  <div className="portrait-placeholder">JC</div>
                </div>
                <h3 className="team-member-name">James Chen</h3>
                <p className="team-member-role">General Manager</p>
                <p className="team-member-bio">
                  James ensures every aspect of your dining experience is exceptional. His dedication to 
                  service excellence and team leadership creates the warm atmosphere Wingy's is known for.
                </p>
              </div>

              <div className="team-member">
                <div className="team-portrait" role="img" aria-label="Sarah Johnson portrait placeholder">
                  <div className="portrait-placeholder">SJ</div>
                </div>
                <h3 className="team-member-name">Sarah Johnson</h3>
                <p className="team-member-role">Sous Chef</p>
                <p className="team-member-bio">
                  Sarah's creativity and technical skills complement Chef Maria's vision perfectly. Her 
                  specialty desserts and seasonal menu innovations keep our offerings fresh and exciting.
                </p>
              </div>

              <div className="team-member">
                <div className="team-portrait" role="img" aria-label="Marcus Williams portrait placeholder">
                  <div className="portrait-placeholder">MW</div>
                </div>
                <h3 className="team-member-name">Marcus Williams</h3>
                <p className="team-member-role">Head Bartender</p>
                <p className="team-member-bio">
                  Marcus crafts signature cocktails that perfectly complement our menu. His expertise in 
                  mixology and friendly personality make the bar a destination in itself.
                </p>
              </div>
            </div>
          </div>
        </section>
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
