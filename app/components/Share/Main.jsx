"use client"

import React, { useState } from 'react';
import ShareDropdown from '@/app/components/Share/ShareDropDown';
import {
  DropdownTheme,
  ButtonSize,
  DropdownPosition,
  AnimationStyle,
  ShareConfig,
  ToastMessage
} from '@/app/type';
import WithoutAnimation from './components/Share/WithoutAnimation';

export default function Main() {
  // Config state for sharing
  const [shareConfig, setShareConfig] = useState<ShareConfig>({
    url: 'https://github.com/google/genai',
    title: 'The Google GenAI SDK for Node/TypeScript',
    description: 'Learn the modern, unified way of calling Gemini 2.5 Flash and Pro models using @google/genai.'
  });

  // Share dropdown parameters state
  const [activeTheme, setActiveTheme] = useState<DropdownTheme>('minimalist');
  const [activeSize, setActiveSize] = useState<ButtonSize>('md');
  const [activePosition, setActivePosition] = useState<DropdownPosition>('bottom-end');
  const [activeAnimation, setActiveAnimation] = useState<AnimationStyle>('spring-slide');
  const [showChevron, setShowChevron] = useState(true);
  const [customButtonText, setCustomButtonText] = useState('Share Resource');

  // Interactive UI state for mockup
  const [likeCount, setLikeCount] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);

  // Toast stack state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast handler helper
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Preset configuration selections
  const themes: { name: string; value: DropdownTheme; desc: string }[] = [
    { name: 'Minimalist', value: 'minimalist', desc: 'Default light/dark responsive slate border design' },
    { name: 'Glassmorphic', value: 'glass', desc: 'Frosted crystal backdrop filter with double borders' },
    { name: 'Sleek Dark', value: 'dark', desc: 'Velvet dark palette for charcoal interfaces' },
    { name: 'Indigo Accents', value: 'indigo', desc: 'Royal blue highlighted buttons and selection zones' },
    { name: 'Bold Light', value: 'light', desc: 'High-contrast bold labels and modern curves' }
  ];

  const sizes: { name: string; value: ButtonSize }[] = [
    { name: 'Small', value: 'sm' },
    { name: 'Medium', value: 'md' },
    { name: 'Large', value: 'lg' }
  ];

  const positions: { name: string; value: DropdownPosition }[] = [
    { name: 'Bottom End (Right)', value: 'bottom-end' },
    { name: 'Bottom Start (Left)', value: 'bottom-start' },
    { name: 'Top End (Right)', value: 'top-end' },
    { name: 'Top Start (Left)', value: 'top-start' },
    { name: 'Left Start (Side)', value: 'left-start' },
    { name: 'Right Start (Side)', value: 'right-start' }
  ];

  const animations: { name: string; value: AnimationStyle; description: string }[] = [
    { name: 'Spring Slide', value: 'spring-slide', description: 'Snappy bounce entrance alignment' },
    { name: 'Fade & Drop', value: 'fade-drop', description: 'Smooth ease-out drift and opacity' },
    { name: 'Scale Elastic', value: 'scale-elastic', description: 'Playful organic growth pop' }
  ];

  const copyConfigUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareConfig.url);
      addToast('Shared URL copied to clipboard!', 'success');
    } catch (err) {
      addToast('Permissions blocked copy function', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-800 font-sans transition-colors duration-300 space-x-24" id="main-playground">

        <WithoutAnimation/>

      <div>
        <ShareDropdown
          config={shareConfig}
          theme={activeTheme}
          size={activeSize}
          position={activePosition}
          animationStyle={activeAnimation}

          buttonText={customButtonText}
          onShareSuccess={(msg) => addToast(msg, 'success')}
        />
      </div>

    
    </div>
  );
}
