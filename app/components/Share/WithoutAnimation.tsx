"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
  Share2, Link, Mail, Linkedin, Twitter, Send,
  MessageSquare, Facebook, Check, Monitor,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { DropdownTheme, ButtonSize, DropdownPosition, ShareOption, ShareConfig } from '@/app/type';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  copy: Link, email: Mail, linkedin: Linkedin,
  twitter: Twitter, telegram: Send,
  whatsapp: MessageSquare, facebook: Facebook,
};

interface ShareDropdownProps {
  config: ShareConfig;
  theme?: DropdownTheme;
  size?: ButtonSize;
  position?: DropdownPosition;
  buttonText?: string;
  onShareSuccess?: (message: string) => void;
}

const DEFAULT_SHARE_OPTIONS: ShareOption[] = [
  { id: '2', name: 'Twitter / X', icon: 'twitter', color: 'text-sky-500', bgHover: '', actionType: 'twitter', urlTemplate: 'https://twitter.com/intent/tweet?url={url}&text={title}' },
  { id: '3', name: 'LinkedIn', icon: 'linkedin', color: 'text-blue-600', bgHover: '', actionType: 'linkedin', urlTemplate: 'https://www.linkedin.com/sharing/share-offsite/?url={url}' },
  { id: '4', name: 'WhatsApp', icon: 'whatsapp', color: 'text-emerald-500', bgHover: '', actionType: 'whatsapp', urlTemplate: 'https://api.whatsapp.com/send?text={title}%20{url}' },
  { id: '5', name: 'Telegram', icon: 'telegram', color: 'text-cyan-500', bgHover: '', actionType: 'telegram', urlTemplate: 'https://t.me/share/url?url={url}&text={title}' },
  { id: '6', name: 'Facebook', icon: 'facebook', color: 'text-blue-700', bgHover: '', actionType: 'facebook', urlTemplate: 'https://www.facebook.com/sharer/sharer.php?u={url}' },
  { id: '7', name: 'System Share', icon: 'native', color: 'text-violet-500', bgHover: '', actionType: 'native' }
];

export default function WithoutAnimation({
  config,
  theme = 'minimalist',
  size = 'md',
  position = 'bottom-end',
  buttonText = 'Share Resource',
  onShareSuccess
}: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(config.url);
      setCopiedId('copy');
      onShareSuccess?.('Copied link to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleOptionClick = async (option: ShareOption) => {
    if (option.actionType === 'copy') {
      await handleCopy();
      setIsOpen(false);
      return;
    }
    if (option.actionType === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({ title: config.title, text: config.description, url: config.url });
          onShareSuccess?.('Shared via system dialog!');
        } catch (err) {
          console.warn('Share cancelled:', err);
        }
      } else {
        await handleCopy();
      }
      setIsOpen(false);
      return;
    }
    if (option.urlTemplate) {
      const url = option.urlTemplate
        .replace('{url}', encodeURIComponent(config.url))
        .replace('{title}', encodeURIComponent(config.title))
        .replace('{desc}', encodeURIComponent(config.description));
      const w = 600, h = 450;
      window.open(url, `share_${option.actionType}`, `width=${w},height=${h},left=${(window.screen.width - w) / 2},top=${(window.screen.height - h) / 2}`);
      onShareSuccess?.(`Sharing via ${option.name}!`);
    }
    setIsOpen(false);
  };

  const buttonSizing = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
    md: 'px-4 py-2 text-sm gap-2 rounded-lg',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl'
  };

  const iconSizing = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  const themeStyles = {
    minimalist: {
      button: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200',
      dropdown: 'bg-white border border-neutral-200 shadow-lg rounded-xl p-1 w-56',
      item: 'flex items-center w-full px-3 py-2 text-[13px] rounded-lg text-neutral-600 font-medium hover:bg-neutral-200/80  transition-colors cursor-pointer outline-none',
    },
    light: {
      button: 'bg-neutral-900 hover:bg-neutral-800 text-white',
      dropdown: 'bg-white border border-neutral-100 shadow-xl rounded-2xl p-1.5 w-60',
      item: 'flex items-center w-full px-3.5 py-2.5 text-sm rounded-xl text-neutral-700 font-medium hover:bg-neutral-100/70  transition-colors cursor-pointer outline-none',
    },
    dark: {
      button: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300',
      dropdown: 'bg-white border border-neutral-200 shadow-xl rounded-xl p-1 w-56',
      item: 'flex items-center w-full px-3 py-2 text-[13px] rounded-lg text-neutral-700 font-medium hover:bg-neutral-100/90  transition-colors cursor-pointer outline-none',
    },
    indigo: {
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/20',
      dropdown: 'bg-white border border-indigo-100 shadow-xl rounded-2xl p-1.5 w-56',
      item: 'flex items-center w-full px-3 py-2 text-sm rounded-xl text-indigo-950 font-medium hover:bg-indigo-50  transition-colors cursor-pointer outline-none',
    },
    glass: {
      button: 'backdrop-blur-md bg-white/40 border border-white/40 text-neutral-800 hover:bg-white/60',
      dropdown: 'backdrop-blur-xl bg-white/75 border border-white/50 shadow-2xl p-1.5 w-60 rounded-2xl',
      item: 'flex items-center w-full px-3.5 py-2.5 text-sm rounded-xl text-neutral-700 font-medium hover:bg-white/90  hover:shadow-xs transition-all cursor-pointer outline-none',
    }
  };

  const positionClasses = {
    'bottom-start': 'top-full left-0 mt-1.5',
    'bottom-end': 'top-full right-0 mt-1.5',
    'top-start': 'bottom-full left-0 mb-1.5',
    'top-end': 'bottom-full right-0 mb-1.5',
    'left-start': 'right-full top-0 mr-1.5',
    'right-start': 'left-full top-0 ml-1.5'
  };

  const s = themeStyles[theme];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center w-6 h-6 p-0.5 rounded-full border border-neutral-300 bg-neutral-700">
        <XIcon size={14} strokeWidth={3} className="text-neutral-50" />
      </div>
      <div ref={containerRef} className="relative inline-block text-left">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className={`flex items-center justify-center hover:cursor-pointer font-medium select-none ${buttonSizing[size]} ${s.button}`}
        >
          <Share2 className={`${iconSizing[size]} shrink-0`} />
          <span>{buttonText}</span>
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className={`absolute z-50 ${positionClasses[position]} ${s.dropdown}`}
          >
            {DEFAULT_SHARE_OPTIONS.map((option) => {
              if (option.actionType === 'native' && typeof navigator.share === 'undefined') return null;
              const Icon = option.actionType === 'native' ? Monitor : iconMap[option.icon];
              const isCopied = option.actionType === 'copy' && copiedId === 'copy';

              return (
                <button
                  key={option.id}
                  role="menuitem"
                  onClick={() => handleOptionClick(option)}
                  className={s.item}
                >
                  <span className={`shrink-0 ${option.color} mr-2.5`}>
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : Icon ? <Icon className="w-4 h-4" /> : null}
                  </span>
                  <span className="truncate">{isCopied ? 'Link Copied!' : option.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}