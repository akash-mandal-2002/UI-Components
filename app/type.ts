export type DropdownTheme = 'light' | 'dark' | 'glass' | 'indigo' | 'minimalist';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type DropdownPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'right-start';
export type AnimationStyle = 'spring-slide' | 'fade-drop' | 'scale-elastic';

export interface ShareOption {
  id: string;
  name: string;
  icon: string; // Dynamic icon name lookup
  color: string; // Brand color for light hover/text accent
  bgHover: string; // Brand background hover class
  actionType: 'copy' | 'email' | 'twitter' | 'linkedin' | 'whatsapp' | 'facebook' | 'native' | 'telegram';
  urlTemplate?: string;
}

export interface ShareConfig {
  url: string;
  title: string;
  description: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface Contact {
  id: number;
  name: string;
  avatar: string;
  status: "Online" | "Away" | "Offline";
  email: string;
  note: string;
  isFavorite: boolean;
  phone?: string;
  lastSeen?: string;
}

export type FilterTab = "All" | "Favorites" | "Online";

export interface Message {
  id: string;
  sender: "user" | "contact";
  text: string;
  time: string;
}
