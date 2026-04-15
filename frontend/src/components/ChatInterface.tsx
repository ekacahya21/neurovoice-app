import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
  audioUrl?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.error('Playback failed:', e));
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[400px] glass-dark rounded-3xl overflow-hidden mt-12">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Live Transcript</h3>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2"
            >
              <p className="text-sm italic">Start speaking to see transcription...</p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  {msg.sender === 'user' && msg.audioUrl && (
                    <button 
                      onClick={() => playAudio(msg.audioUrl!)}
                      className="p-1 rounded-full bg-brand/10 hover:bg-brand/20 text-brand-light transition-colors group"
                      title="Play original audio"
                    >
                      <Volume2 size={12} className="group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    {msg.sender === 'user' ? 'You' : 'NeuroVoice'}
                  </span>
                </div>
                <div 
                  className={`relative max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-brand text-white rounded-tr-none' 
                      : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 bg-brand-light ml-1 animate-pulse align-middle" />}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
