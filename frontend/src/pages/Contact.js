import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import api from '../lib/api';

const Contact = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(response => setSettings(response.data))
      .catch(error => console.error('Failed to fetch settings:', error));
  }, []);

  return (
    <div className="min-h-screen bg-white py-20" data-testid="contact-page">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8 font-['Montserrat']">
            CONTACT US
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-12"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-black mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-2">EMAIL</h3>
              <p className="text-sm text-gray-600">
                {settings?.contact_email || 'info@luxurystore.com'}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-black mb-4">
                <Phone size={24} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-2">PHONE</h3>
              <p className="text-sm text-gray-600">
                {settings?.contact_phone || '+1 (555) 123-4567'}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-black mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-2">ADDRESS</h3>
              <p className="text-sm text-gray-600">
                {settings?.contact_address || '123 Luxury Ave, New York, NY 10001'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
