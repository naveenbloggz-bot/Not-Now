import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import api from '../lib/api';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(response => setSettings(response.data))
      .catch(error => console.error('Failed to fetch settings:', error));
  }, []);

  return (
    <footer data-testid="footer" className="bg-white border-t border-gray-200 py-20">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold tracking-[0.2em] uppercase mb-4 font-['Montserrat']">
              {settings?.brand_name || 'LUXURY STORE'}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {settings?.about_text || 'Premium luxury products for the discerning customer.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/shop" className="text-sm text-gray-600 hover:text-black transition-colors">
                Shop
              </Link>
              <Link to="/about" className="text-sm text-gray-600 hover:text-black transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-black transition-colors">
                Contact
              </Link>
              <Link to="/reviews" className="text-sm text-gray-600 hover:text-black transition-colors">
                Reviews
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Contact</h4>
            <div className="flex flex-col space-y-2 text-sm text-gray-600">
              <p>{settings?.contact_email || 'info@luxurystore.com'}</p>
              <p>{settings?.contact_phone || '+1 (555) 123-4567'}</p>
              <p>{settings?.contact_address || '123 Luxury Ave, New York, NY 10001'}</p>
              
              {/* Social Icons */}
              <div className="flex space-x-4 pt-4">
                {settings?.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="facebook-link"
                    className="hover:opacity-50 transition-opacity"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {settings?.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="instagram-link"
                    className="hover:opacity-50 transition-opacity"
                  >
                    <Instagram size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {settings?.brand_name || 'Luxury Store'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;