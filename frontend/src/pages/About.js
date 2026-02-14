import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';

const About = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(response => setSettings(response.data))
      .catch(error => console.error('Failed to fetch settings:', error));
  }, []);

  return (
    <div className="min-h-screen bg-white py-20" data-testid="about-page">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8 font-['Montserrat']">
            ABOUT US
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-12"></div>

          <div className="text-base md:text-lg leading-relaxed text-gray-800 space-y-6">
            <p>
              {settings?.about_text || 'We are committed to delivering exceptional luxury products that combine timeless elegance with modern sophistication.'}
            </p>
            <p>
              Every piece in our collection is carefully curated to bring you the finest quality and craftsmanship. We believe in creating not just products, but experiences that last a lifetime.
            </p>
            <p>
              Our dedication to excellence and attention to detail sets us apart in the world of luxury retail.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
