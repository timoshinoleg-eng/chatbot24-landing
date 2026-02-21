export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Условия использования</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Общие положения</h2>
            <p className="text-slate-300 mb-4">
              1.1. Настоящие Условия использования регулируют отношения между пользователем сайта chatbot24.su и Индивидуальным предпринимателем, осуществляющим деятельность под брендом ChatBot24.
            </p>
            <p className="text-slate-300 mb-4">
              1.2. Использование сайта означает согласие с настоящими Условиями.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Услуги</h2>
            <p className="text-slate-300 mb-4">ChatBot24 предоставляет следующие услуги:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Разработка чат-ботов</li>
              <li>Автоматизация бизнес-процессов</li>
              <li>Интеграция с CRM и мессенджерами</li>
              <li>Консультации по цифровизации</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Интеллектуальная собственность</h2>
            <p className="text-slate-300 mb-4">
              Все материалы сайта защищены авторским правом. Копирование без разрешения запрещено.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Ограничение ответственности</h2>
            <p className="text-slate-300 mb-4">
              Оператор не несёт ответственности за перебои в работе сайта, вызванные техническими неполадками.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Контакты</h2>
            <p className="text-slate-300">Email: info@chatbot24.su</p>
          </section>

          <p className="text-slate-400 text-sm mt-12">
            Дата последнего обновления: 21.02.2025
          </p>
        </div>
      </div>
    </div>
  );
}