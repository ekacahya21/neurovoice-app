import { useState, useEffect, useRef, useCallback } from 'react';

export type SessionStatus = 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'ERROR';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming: boolean;
}

export const useNeuroVoice = () => {
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [messages, setMessages] = useState<Message[]>([]);
  const [volume, setVolume] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    socketRef.current?.close();
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    
    socketRef.current = null;
    audioContextRef.current = null;
    workletNodeRef.current = null;
    micStreamRef.current = null;
    setStatus('IDLE');
    setIsThinking(false);
  }, []);

  const startSession = async () => {
    if (status !== 'IDLE') return;
    
    setStatus('CONNECTING');
    
    try {
      // 1. Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Audio Context & Worklet
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      console.log('Loading AudioWorklet...');
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('AudioContext resumed.');
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'neurovoice-audio-processor');
      
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;
      
      source.connect(workletNode);
      workletNode.connect(silentGain);
      silentGain.connect(audioContext.destination);
      
      workletNodeRef.current = workletNode;

      // 3. WebSocket Connection
      const ws = new WebSocket('ws://localhost:8000/ws/conversation');
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('ACTIVE');
        console.log('Connected to NeuroVoice Backend');
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          
          if (data.type === 'volume') {
            setVolume(data.value);
          } else if (data.type === 'transcription' || data.type === 'ai_text') {
            if (data.type === 'ai_text') setIsThinking(false);
            handleTextUpdate(data);
          }
        } else if (event.data instanceof Blob) {
            setIsThinking(false);
            // In a real app, play this back or append to a buffer
            console.log("Received AI audio bytes");
        }
      };

      ws.onerror = (err) => {
        console.error('Socket error:', err);
        setStatus('ERROR');
      };

      ws.onclose = () => {
        cleanup();
      };

      // 4. Send audio chunks + metadata from worklet to websocket
      workletNode.port.onmessage = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          if (event.data instanceof ArrayBuffer) {
            ws.send(event.data);
          } else if (event.data && event.data.type === 'sentence_end') {
            console.log('[Worklet] Sentence ended. Signaling backend.');
            ws.send(JSON.stringify(event.data));
            setIsThinking(true);
          }
        }
      };

    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus('ERROR');
      cleanup();
    }
  };

  const handleTextUpdate = (data: any) => {
    setMessages(prev => {
        const isUser = data.type === 'transcription';
        const isPartial = data.isPartial;

        if (isUser && isPartial) {
          // If we have an existing partial user message, update it.
          // Otherwise, append a new partial message.
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.sender === 'user' && lastMsg.isStreaming) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...lastMsg, text: data.text };
            return updated;
          } else {
            return [...prev, { id: 'partial-user', sender: 'user', text: data.text, isStreaming: true }];
          }
        } else if (isUser && !isPartial) {
          // This is a final commit. Find the partial and "solidify" it.
          const filtered = prev.filter(m => m.id !== 'partial-user');
          const finalMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: data.text,
            isStreaming: false
          };
          return [...filtered, finalMsg];
        } else {
          // AI message handling
          // (Simplistic: append for now, but in real app would handle streaming chunks)
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.text,
            isStreaming: true // AI responses in this app are often streamed
          };
          return [...prev, aiMsg];
        }
    });
  };

  const stopSession = () => {
    cleanup();
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    status,
    messages,
    volume,
    isThinking,
    startSession,
    stopSession
  };
};
