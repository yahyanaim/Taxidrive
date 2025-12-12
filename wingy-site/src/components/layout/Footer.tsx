'use client';

import React from 'react';
import Link from 'next/link';
import { contactInfo, formatPhoneNumber } from '@/data/contact';
import { socialLinks } from '@/data/social';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-chocolate text-sand">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold mb-4">
              <span className="text-2xl">🍗</span>
              <span>Wingy</span>
            </Link>
            <p className="text-sand/80 text-sm leading-relaxed mb-6">
              Serving the most delicious wings in Flavor Town with over 20 unique flavors 
              and styles. From classic buffalo to exotic fusion, we've got something for everyone.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand/70 hover:text-gold transition-colors duration-200"
                  aria-label={`Follow us on ${social.platform}`}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sand/80 hover:text-gold transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/menu" 
                  className="text-sand/80 hover:text-gold transition-colors duration-200"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sand/80 hover:text-gold transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sand/80 hover:text-gold transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-sand/80 text-sm">
                  <p>{contactInfo.address.street}</p>
                  <p>{contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zip}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a 
                  href={`tel:${contactInfo.phone}`} 
                  className="text-sand/80 hover:text-gold transition-colors duration-200 text-sm"
                >
                  {formatPhoneNumber(contactInfo.phone)}
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a 
                  href={`mailto:${contactInfo.email}`} 
                  className="text-sand/80 hover:text-gold transition-colors duration-200 text-sm"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold">Hours</h3>
            <div className="space-y-2">
              {Object.entries(contactInfo.hours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center text-sm">
                  <span className="text-sand/80 capitalize font-medium">{day.slice(0, 3)}</span>
                  <span className="text-sand/80">
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-chocolate-light/30 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sand/60 text-sm">
              © {currentYear} Wingy Restaurant. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/privacy" 
                className="text-sand/60 hover:text-gold text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-sand/60 hover:text-gold text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
