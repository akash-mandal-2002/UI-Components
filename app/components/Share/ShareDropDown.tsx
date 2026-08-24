"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2, Link, Mail, Linkedin, Twitter, Send,
  MessageSquare, Facebook, Check, Monitor,
  CheckIcon,
  XIcon
} from 'lucide-react';
import {
  DropdownTheme, ButtonSize, DropdownPosition,
  AnimationStyle, ShareOption, ShareConfig
} from '@/app/type';

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
  animationStyle?: AnimationStyle;
  showChevron?: boolean;
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

export default function ShareDropdown({
  config,
  theme = 'minimalist',
  size = 'md',
  position = 'bottom-end',
  animationStyle = 'spring-slide',
  showChevron = true,
  buttonText = 'Share Resource',
  onShareSuccess
}: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  // ✅ NEW: layoutId hover state
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0, opacity: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (!isOpen) {
      setFocusedIndex(-1);
      // ✅ Reset hover when dropdown closes
      setHoveredId(null);
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      const optionsLength = DEFAULT_SHARE_OPTIONS.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1 >= optionsLength ? 0 : prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 < 0 ? optionsLength - 1 : prev - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (focusedIndex >= 0 && focusedIndex < optionsLength) {
          e.preventDefault();
          handleOptionClick(DEFAULT_SHARE_OPTIONS[focusedIndex]);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex]);

  useEffect(() => {
    if (focusedIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="menuitem"]');
      const target = items[focusedIndex] as HTMLElement;
      if (target) {
        target.focus();
        setPillStyle({
          top: target.offsetTop,
          height: target.offsetHeight,
          opacity: 1
        });
      }
    } else {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [focusedIndex]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(config.url);
      setCopiedId('copy');
      if (onShareSuccess) onShareSuccess('Copied link directly to clipboard!');
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
          if (onShareSuccess) onShareSuccess('Shared via system dialog!');
        } catch (err) {
          console.warn('System share error or cancellation:', err);
        }
      } else {
        await handleCopy();
      }
      setIsOpen(false);
      return;
    }
    if (option.urlTemplate) {
      const formattedUrl = option.urlTemplate
        .replace('{url}', encodeURIComponent(config.url))
        .replace('{title}', encodeURIComponent(config.title))
        .replace('{desc}', encodeURIComponent(config.description));
      try {
        const width = 600, height = 450;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(formattedUrl, `share_${option.actionType}`, `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0,resizable=yes`);
        if (onShareSuccess) onShareSuccess(`Opened sharing pop-up for ${option.name}!`);
      } catch (err) {
        console.log("Intent url blocked:", formattedUrl);
        if (onShareSuccess) onShareSuccess(`Sharing via ${option.name} triggered!`);
      }
    }
    setIsOpen(false);
  };

  const buttonSizing = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md font-medium',
    md: 'px-4 py-2 text-sm gap-2 rounded-lg font-medium',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl font-medium'
  };

  const iconSizing = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const themeStyles = {
    minimalist: {
      button: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 active:bg-neutral-100 duration-150',
      dropdown: 'bg-white border border-neutral-200 shadow-lg rounded-xl p-1 w-56',
      item: 'flex items-center w-full px-3 py-2 text-[13px] rounded-lg text-neutral-600 group-hover:text-neutral-900 font-medium transition-colors outline-none cursor-pointer',
      hoverBg: 'bg-neutral-200/70'
    },
  };

  const animationVariants = {
    'spring-slide': {
      hidden: { opacity: 0, y: 8, scale: 0.96 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 24 } },
      exit: { opacity: 0, y: 5, scale: 0.96, transition: { duration: 0.12, ease: 'easeOut' } }
    },
    'fade-drop': {
      hidden: { opacity: 0, y: -6 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } }
    },
    'scale-elastic': {
      hidden: { opacity: 0, scale: 0.75, y: 4 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 480, damping: 18 } },
      exit: { opacity: 0, scale: 0.85, transition: { duration: 0.1 } }
    }
  };

  const positionClasses = {
    'bottom-start': 'top-full left-0 mt-1.5 origin-top-left',
    'bottom-end': 'top-full right-0 mt-1.5 origin-top-right',
    'top-start': 'bottom-full left-0 mb-1.5 origin-bottom-left',
    'top-end': 'bottom-full right-0 mb-1.5 origin-bottom-right',
    'left-start': 'right-full top-0 mr-1.5 origin-top-right',
    'right-start': 'left-full top-0 ml-1.5 origin-top-left'
  };

  const selectedTheme = themeStyles[theme];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center w-6 h-6 p-0.5 rounded-full border border-neutral-50 bg-blue-400">
        <CheckIcon size={14} strokeWidth={3} className="text-neutral-50" />
      </div>

      <div ref={containerRef} className="relative inline-block text-left" id="share_dropdown_container">

        <motion.button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center justify-center cursor-pointer select-none active:scale-95 ${buttonSizing[size]} ${selectedTheme.button}`}
          id="share_trigger_button"
        >
          <Share2 className={`${iconSizing[size]} shrink-0`} />
          <span>{buttonText}</span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              role="menu"
              aria-orientation="vertical"
              id="share_dropdown_menu"
              className={`absolute z-50 ${positionClasses[position]} ${selectedTheme.dropdown}`}
              variants={animationVariants[animationStyle]}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* ✅ onMouseLeave resets hover — pill disappears cleanly */}
              <div
                className="flex flex-col gap-0.5 relative"
                onMouseLeave={() => {
                  setHoveredId(null);
                  setFocusedIndex(-1);
                }}
              >
                <motion.div
                  className={`absolute left-0 right-0 ${selectedTheme.item.includes('rounded-xl') ? 'rounded-xl' : 'rounded-lg'} ${selectedTheme.hoverBg} pointer-events-none z-0`}
                  initial={false}
                  animate={{
                    top: pillStyle.top,
                    height: pillStyle.height,
                    opacity: pillStyle.opacity
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
                {DEFAULT_SHARE_OPTIONS.map((option, idx) => {
                  if (option.actionType === 'native' && typeof navigator.share === 'undefined') return null;

                  const CustomIcon = option.actionType === 'native' ? Monitor : iconMap[option.icon];
                  const isCopied = option.actionType === 'copy' && copiedId === 'copy';

                  return (
                    <button
                      key={option.id}
                      role="menuitem"
                      tabIndex={isOpen ? 0 : -1}
                      // ✅ hoveredId set on enter, focusedIndex stays for keyboard
                      onMouseEnter={() => {
                        setHoveredId(option.id);
                        setFocusedIndex(idx);
                      }}
                      onClick={() => handleOptionClick(option)}
                      // ✅ relative + overflow-hidden so animated pill clips inside button
                      className={`relative group z-10 ${selectedTheme.item} bg-transparent`}
                      id={`share_item_${option.id}`}
                    >
                      {/* ✅ Content sits above the animated bg */}
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5">
                          <span className={`transition-transform duration-200 shrink-0 ${option.color} group-hover:scale-110`}>
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : CustomIcon ? (
                              <CustomIcon className="w-4 h-4" />
                            ) : null}
                          </span>
                          <span className="truncate">
                            {isCopied ? 'Link Copied!' : option.name}
                          </span>
                        </div>

                        {option.actionType === 'copy' && !isCopied && (
                          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-neutral-400 border border-neutral-100 rounded bg-neutral-50 group-hover:border-neutral-200">
                            ⌘C
                          </kbd>
                        )}
                        {option.actionType !== 'copy' && option.actionType !== 'native' && (
                          <span className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 text-neutral-400 transition-opacity duration-150">
                            <Check className="w-3.5 h-3.5 text-neutral-300" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}