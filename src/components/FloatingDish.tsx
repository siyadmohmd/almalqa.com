'use client';

import { motion } from 'framer-motion';

interface FloatingDishProps {
  src: string;
  alt: string;
  delay?: number;
  className?: string;
}

export default function FloatingDish({ src, alt, delay = 0, className = '' }: FloatingDishProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: delay,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full aspect-square object-cover rounded-2xl drop-shadow-2xl"
        loading="eager"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Shadow underneath */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-licorice/20 rounded-full blur-md"
        animate={{
          scale: [1, 0.9, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: delay,
        }}
      />
    </motion.div>
  );
}
