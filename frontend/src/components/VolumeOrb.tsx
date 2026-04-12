import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VolumeOrbProps {
  volume: number; // 0 to 1
  isActive: boolean;
}

export const VolumeOrb: React.FC<VolumeOrbProps> = ({ volume, isActive }) => {
  // Scale the orb base on volume. We add a base scale so it's visible even at 0.
  const scale = isActive ? 1 + volume * 1.5 : 1;
  const opacity = isActive ? 0.8 + volume * 0.2 : 0.4;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Dynamic Background Glow */}
      <motion.div
        animate={{
          scale: isActive ? [scale, scale * 1.1, scale] : 1,
          opacity: isActive ? [0.3, 0.5, 0.3] : 0.1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-brand blur-3xl"
      />

      {/* Primary Orb */}
      <motion.div
        animate={{ 
          scale: scale,
          rotate: isActive ? 360 : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          rotate: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
        className={`relative w-32 h-32 rounded-full glass flex items-center justify-center shadow-2xl overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-light to-brand opacity-60" />
        
        {/* Inner Details / Micro-animations */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-2 border-2 border-white/30 rounded-full border-dashed animate-spin-slow"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status Indicators */}
      <div className="absolute -bottom-8">
        <span className={`text-xs font-medium tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-brand' : 'text-slate-400'}`}>
          {isActive ? 'Listening...' : 'Ready'}
        </span>
      </div>
    </div>
  );
};
