"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Send, MessageCircle, User, Mail, Check, Loader2, AlertCircle } from "lucide-react";

interface FormData {
  telegram: string;
  name: string;
  message: string;
}

interface FormErrors {
  telegram?: string;
  name?: string;
  message?: string;
}

export function CTASection() {
  const [formData, setFormData] = useState<FormData>({
    telegram: "",
    name: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.telegram.trim()) {
      newErrors.telegram = "Укажите ваш Telegram";
    } else if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(formData.telegram.replace("@", ""))) {
      newErrors.telegram = "Некорректный формат username";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Укажите ваше имя";
    } else if (formData.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Опишите вашу задачу";
    } else if (formData.message.length < 10) {
      newErrors.message = "Сообщение должно содержать минимум 10 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          telegram: formData.telegram.startsWith("@")
            ? formData.telegram
            : `@${formData.telegram}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка отправки формы");
      }

      setIsSubmitted(true);
      setFormData({ telegram: "", name: "", message: "" });
    } catch (error) {
      setSubmitError("Не удалось отправить сообщение. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <section id="cta" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center bg-surface border-accent-green/30">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-green/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-accent-green" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Заявка отправлена!
            </h2>
            <p className="text-text-secondary mb-6">
              Мы получили вашу заявку и свяжемся с вами в Telegram в течение рабочего дня
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="border-text-muted/30 text-text-primary hover:bg-surface"
            >
              Отправить ещё одну
            </Button>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="cta" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 mb-6">
            <Send className="w-4 h-4 text-accent-green" />
            <span className="text-sm text-accent-green">Начать проект</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Готовы автоматизировать продажи?
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Заполните форму — мы изучим вашу задачу и предложим решение
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <Card className="p-8 bg-surface border-text-muted/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Telegram */}
              <div>
                <label
                  htmlFor="telegram"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Telegram *
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    id="telegram"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    placeholder="@username"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 transition-all ${
                      errors.telegram
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-text-muted/20 focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.telegram && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.telegram}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Ваше имя *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Иван"
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-text-muted/20 focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Опишите задачу *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Например: Нужен бот для записи клиентов в салон красоты..."
                    rows={4}
                    className={`w-full pl-12 pr-4 py-3 bg-[#0a0a0f] border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.message
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-text-muted/20 focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.message && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent-green hover:bg-accent-green/90 text-white font-semibold py-4 rounded-xl shadow-lg shadow-accent-green/25 hover:shadow-accent-green/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    Отправить заявку
                    <Send className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-text-muted text-center">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
              </p>
            </form>
          </Card>

          {/* Benefits */}
          <div className="space-y-6">
            <Card className="p-6 bg-surface/50 border-text-muted/10">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Что будет дальше?
              </h3>
              <ul className="space-y-4">
                {[
                  "Изучим вашу задачу в течение 2 часов",
                  "Зададим уточняющие вопросы в Telegram",
                  "Подготовим коммерческое предложение",
                  "Согласуем сроки и стоимость",
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-text-secondary">{step}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent-purple/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">
                    Без предоплаты
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Оплачивайте только после запуска и проверки работы бота
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent-cyan/5 to-primary/5 border-accent-cyan/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-accent-cyan" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">
                    Прямая связь
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Общаемся в Telegram — быстро и без бюрократии
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
