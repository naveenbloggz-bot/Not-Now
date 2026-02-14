import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { Button } from './ui/button';

const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    api.get('/banners')
      .then(response => setBanners(response.data.slice(0, 4)))
      .catch(error => console.error('Failed to fetch banners:', error));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (banners.length === 0) return null;

  return (
    <div className="relative bg-white" data-testid="hero-banner">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0 relative"
              style={{ aspectRatio: '16/9' }}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center text-white px-4 max-w-2xl"
                >
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-4 font-['Montserrat']">
                    {banner.title}
                  </h1>
                  <p className="text-base md:text-lg mb-2 leading-relaxed">
                    {banner.description}
                  </p>
                  <p className="text-3xl md:text-4xl font-light mb-8">${banner.price.toFixed(2)}</p>
                  <Link to={banner.product_id ? `/product/${banner.product_id}` : '/shop'}>
                    <Button
                      data-testid={`shop-now-${banner.id}`}
                      className="rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 px-8 bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-300"
                    >
                      SHOP NOW
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            data-testid="banner-prev"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 hover:bg-white transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollNext}
            data-testid="banner-next"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 hover:bg-white transition-all"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;