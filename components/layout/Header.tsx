'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ============================================
// Types & Interfaces
// ============================================

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  className?: string;
}

// ============================================
// Navigation Data
// ============================================

const navItems: NavItem[] = [
  { label: 'Услуги', href: '/services' },
  { label: 'Кейсы', href: '/cases' },
  { label: 'Блог', href: '/blog' },
  { label: 'Контакты', href: '/contacts' },
];

// ============================================
// Animated Logo Component
// ============================================

function AnimatedLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative w-10 h-10">
        {/* Gradient background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse-glow" />
        
        {/* Inner content */}
        <div className="absolute inset-0.5 rounded-[10px] bg-surface flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-indigo-400 group-hover:text-indigo-300 transition-colors"
          >
            {/* Bot head */}
            <rect
              x="4"
              y="6"
              width="16"
              height="14"
              rx="3"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            {/* Eyes */}
            <circle
              cx="9"
              cy="12"
              r="1.5"
              fill="currentColor"
              className="animate-pulse"
            />
            <circle
              cx="15"
              cy="12"
              r="1.5"
              fill="currentColor"
              className="animate-pulse"
            />
            {/* Antenna */}
            <line
              x1="12"
              y1="6"
              x2="12"
              y2="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="12"
              cy="2"
              r="1.5"
              fill="currentColor"
              className="animate-pulse"
            />
            {/* Smile */}
            <path
              d="M9 15c1.5 1.5 4.5 1.5 6 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
      
      {/* Logo text */}
      <span className="text-xl font-bold">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          ChatBot
        </span>
        <span className="text-text-primary">24</span>
      </span>
    </Link>
  );
}

// ============================================
// Mobile Menu Component
// ============================================

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      {/* Menu panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 w-[280px] bg-surface border-l border-white/10 z-50 lg:hidden',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="self-end p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Закрыть меню"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="px-4 py-3 text-lg text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="mt-auto">
            <Button href="https://t.me/ChatBot24su_bot?start=landing" variant="primary" size="lg" glow className="w-full">
              Заказать бота
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Main Header Component
// ============================================

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
          isScrolled
            ? 'bg-surfaceGlass/90 backdrop-blur-xl border-b border-white/10 py-3'
            : 'bg-transparent py-5',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <AnimatedLogo />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Button href="https://t.me/ChatBot24su_bot?start=landing" variant="primary" size="md" glow>
                Заказать бота
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Открыть меню"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}

export default Header;
