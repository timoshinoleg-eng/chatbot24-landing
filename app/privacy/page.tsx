export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Политика конфиденциальности</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Общие положения</h2>
            <p className="text-slate-300 mb-4">
              1.1. Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта chatbot24.su.
            </p>
            <p className="text-slate-300 mb-4">
              1.2. Оператором персональных данных является Индивидуальный предприниматель, осуществляющий деятельность под брендом ChatBot24.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Персональные данные</h2>
            <p className="text-slate-300 mb-4">Оператор может обрабатывать следующие персональные данные:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Фамилия, имя, отчество</li>
              <li>Контактный телефон</li>
              <li>Адрес электронной почты</li>
              <li>Название компании/организации</li>
              <li>IP-адрес и данные cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Цели обработки</h2>
            <p className="text-slate-300 mb-4">Персональные данные обрабатываются для:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Предоставления консультаций и информации об услугах</li>
              <li>Заключения и исполнения договоров</li>
              <li>Обратной связи с пользователем</li>
              <li>Улучшения качества услуг</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Контактная информация</h2>
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