'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================
// Types & Interfaces
// ============================================

interface FooterProps {
  className?: string;
}

interface ContactLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// ============================================
// Contact Data
// ============================================

const contactLinks: ContactLink[] = [
  {
    label: '@ChatBot24su_bot',
    href: 'https://t.me/ChatBot24su_bot',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: 'info@chatbot24.su',
    href: 'mailto:info@chatbot24.su',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

// ============================================
// Logo Component
// ============================================

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0.5 rounded-[6px] bg-surface flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-indigo-400"
          >
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
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            <line
              x1="12"
              y1="6"
              x2="12"
              y2="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="2" r="1.5" fill="currentColor" />
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
      <span className="text-lg font-bold">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          ChatBot
        </span>
        <span className="text-text-primary">24</span>
      </span>
    </Link>
  );
}

// ============================================
// Main Footer Component
// ============================================

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t border-white/10 bg-surface',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <FooterLogo />
            <p className="text-text-secondary text-sm max-w-xs">
              Создаем интеллектуальных чат-ботов для автоматизации бизнеса. 
              Продажи, поддержка, запись — 24/7.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h3 className="text-text-primary font-semibold">Навигация</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/services"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Услуги
              </Link>
              <Link
                href="/cases"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Кейсы
              </Link>
              <Link
                href="/blog"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Блог
              </Link>
              <Link
                href="/contacts"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Контакты
              </Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-text-primary font-semibold">Контакты</h3>
            <div className="flex flex-col gap-3">
              {contactLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm group"
                >
                  <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {link.icon}
                  </span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-sm text-center sm:text-left">
              © {currentYear} ChatBot24. Все права защищены.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-text-muted hover:text-text-secondary transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms"
                className="text-text-muted hover:text-text-secondary transition-colors"
              >
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
