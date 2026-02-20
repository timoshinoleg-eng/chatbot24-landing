"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Bot, Play, Shield, ArrowRight, Sparkles } from "lucide-react";
import AIChatDemo from "./AIChatDemo";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />
        
        {/* Animated gradient mesh */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4">
                <animate attributeName="stop-opacity" values="0.4;0.6;0.4" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2">
                <animate attributeName="stop-opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 border border-primary/20 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">AI-автоматизация для бизнеса</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-100">
              <span className="text-text-primary">Автоматизируй </span>
              <span className="text-gradient">продажи</span>
              <br />
              <span className="text-text-primary">с AI-ботами</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 mb-4 animate-fade-in-up animation-delay-200">
              Внедрение чат-ботов для бизнеса любого масштаба. 
              Автоматизация бизнеса ИИ: от первого сообщения до продажи — 
              без участия менеджеров 24/7.
            </p>

            {/* Trust Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-10 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/30">
                <Bot className="w-4 h-4 text-accent-green" />
                <span className="text-sm font-medium text-accent-green">Бот работает 24/7</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-text-muted/30">
                <Shield className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-secondary">Безопасность данных</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-400">
              <Button
                size="lg"
                onClick={() => scrollToSection("cta")}
                className="w-full sm:w-auto bg-accent-green hover:bg-accent-green/90 text-white font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-accent-green/25 hover:shadow-accent-green/40 transition-all duration-300 group"
              >
                Заполнить бриф
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("scenarios")}
                className="w-full sm:w-auto border-text-muted/30 text-text-primary hover:bg-surface hover:border-primary/50 px-8 py-6 text-base rounded-xl transition-all duration-300 group"
              >
                <Play className="mr-2 w-5 h-5 text-primary" />
                Посмотреть сценарии
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0 mt-12 pt-12 border-t border-text-muted/10 animate-fade-in-up animation-delay-500">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient">50+</div>
                <div className="text-sm text-text-muted mt-1">Реализованных ботов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient">24/7</div>
                <div className="text-sm text-text-muted mt-1">Работа без перерыва</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient">3 дня</div>
                <div className="text-sm text-text-muted mt-1">Средний срок запуска</div>
              </div>
            </div>
          </div>

          {/* Right Column - AI Chat */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up animation-delay-300">
            <AIChatDemo />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-text-muted/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-text-muted rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}