import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Запрашиваемая страница не существует или была удалена.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-80px-300px)] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-b from-white via-white/50 to-transparent bg-clip-text text-transparent select-none">
            404
          </div>
          {/* Animated glitch effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Страница не найдена
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Запрашиваемая страница не существует или была удалена. Возможно, вы
          ввели неправильный адрес или страница была перемещена.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-white/10 text-white font-medium rounded-xl hover:border-white/20 transition-colors"
          >
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
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            В блог
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-text-muted text-sm mb-4">
            Попробуйте перейти по одной из этих ссылок:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/services"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Услуги
            </Link>
            <span className="text-white/20">•</span>
            <Link
              href="/cases"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Кейсы
            </Link>
            <span className="text-white/20">•</span>
            <Link
              href="/contacts"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
