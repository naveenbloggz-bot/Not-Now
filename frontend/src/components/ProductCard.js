import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

const ProductCard = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group relative bg-white overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.images[0] || 'https://via.placeholder.com/400x600'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="py-6">
          <h3 className="text-xl font-bold tracking-widest uppercase mb-2 font-['Montserrat']">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          <p className="text-lg font-light">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      {product.in_stock && (
        <Link to={`/product/${product.id}`}>
          <Button
            data-testid={`view-product-${product.id}`}
            className="w-full rounded-none uppercase tracking-[0.15em] font-bold text-sm h-12 bg-black text-white border border-black hover:bg-transparent hover:text-black transition-all duration-300"
          >
            VIEW DETAILS
          </Button>
        </Link>
      )}
    </motion.div>
  );
};

export default ProductCard;