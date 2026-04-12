import React from 'react';
import { VolumeOrb } from './components/VolumeOrb';
import { ChatInterface } from './components/ChatInterface';
import { ControlButton } from './components/ControlButton';
import { useNeuroVoice } from './hooks/useNeuroVoice';
import { motion } from 'framer-motion';

function App() {
  const { status, messages, volume, isThinking, startSession, stopSession } = useNeuroVoice();

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-brand/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center max-w-4xl w-full"
      >
        {/* Title Section */}
        <header className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl font-extrabold tracking-tighter text-white mb-4"
          >
            Neuro<span className="text-brand">Voice</span>
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Experience the future of real-time AI conversation with ultra-low latency.
          </p>
        </header>

        {/* Interaction Core */}
        <div className="flex flex-col items-center w-full gap-8">
          <VolumeOrb volume={volume} isActive={status === 'ACTIVE'} isThinking={isThinking} />
          
          <div className="mt-8">
            <ControlButton 
              status={status} 
              onStart={startSession} 
              onStop={stopSession} 
            />
          </div>

          <ChatInterface messages={messages} />
        </div>

        {/* Footer info */}
        <footer className="mt-20 text-slate-600 text-[10px] uppercase tracking-[0.2em]">
          Powered by Gemini & Faster-Whisper • 16kHz PCM Pipeline
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
