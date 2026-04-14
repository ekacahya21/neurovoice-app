import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ControlButtonProps {
  status: 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'ERROR';
  onStart: () => void;
  onStop: () => void;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ status, onStart, onStop }) => {
  const isConnecting = status === 'CONNECTING';
  const isActive = status === 'ACTIVE';

  const handleClick = () => {
    if (isActive) {
      onStop();
    } else if (status === 'IDLE' || status === 'ERROR') {
      onStart();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isConnecting}
      className={`
        relative px-8 py-4 rounded-full font-bold tracking-wide transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-2xl
        ${isActive 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-brand text-white hover:bg-brand-dark'}
        ${isConnecting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Background Animated Glow */}
      <motion.div 
        animate={{
          opacity: isActive ? [0.4, 0.7, 0.4] : 0
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-white/20"
      />

      <span className="relative z-10">
        {isConnecting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isActive ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </span>

      <span className="relative z-10">
        {isConnecting ? 'Initializing...' : isActive ? 'End Session' : 'Start Conversation'}
      </span>
    </motion.button>
  );
};
