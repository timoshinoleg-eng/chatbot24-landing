import Head from "next/head";
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";

// Dynamic import for HeroWidget (client-side only)
const HeroWidget = dynamic(
  () => import("../components/HeroWidget"),
  { ssr: false }
);

export default function Home() {
  // Get variant from URL or use default
  const getVariant = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const variant = params.get("variant");
      if (variant === "A" || variant === "B" || variant === "C") {
        return variant;
      }
    }
    return "A";
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ChatBot24 Studio — Telegram-боты под ключ для бизнеса</title>
        <meta name="description" content="Проектируем и внедряем Telegram-ботов для продаж и автоматизации. Мгновенная логика, квалификация лидов, интеграция с CRM." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Yandex Metrica */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${process.env.NEXT_PUBLIC_YM_COUNTER_ID || "00000000"}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            `,
          }}
        />
        
        {/* GA4 */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID || "G-XXXXXXXXXX"}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID || "G-XXXXXXXXXX"}');
            `,
          }}
        />
      </Head>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Чат-боты под ключ
              <br />
              <span className={styles.highlight}>для бизнеса</span>
            </h1>
            <p className={styles.subtitle}>
              Проектируем сценарии, интегрируем с CRM, запускаем за 10–14 дней
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⚡</span>
                <span>Мгновенная логика</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🎯</span>
                <span>Квалификация лидов</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔗</span>
                <span>Интеграция с CRM</span>
              </div>
            </div>
            <div className={styles.cta}>
              <a
                href="https://t.me/ChatBot24su_bot"
                className={styles.ctaButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Написать в Telegram
              </a>
              <a href="#cases" className={styles.ctaSecondary}>
                Смотреть кейсы
              </a>
            </div>
          </div>
          
          <div className={styles.heroWidget}>
            <HeroWidget
              variant={getVariant()}
              ymCounterId={process.env.NEXT_PUBLIC_YM_COUNTER_ID}
            />
          </div>
        </div>

        <section id="cases" className={styles.section}>
          <h2 className={styles.sectionTitle}>Кейсы и результаты</h2>
          <div className={styles.cases}>
            <div className={styles.caseCard}>
              <h3>🏢 Недвижимость</h3>
              <p>+37% квалифицированных лидов</p>
              <span className={styles.caseMeta}>AmoCRM • 12 дней</span>
            </div>
            <div className={styles.caseCard}>
              <h3>🛒 Telegram-магазин</h3>
              <p>Оплата внутри бота (ЮKassa)</p>
              <span className={styles.caseMeta}>1С • 18 дней</span>
            </div>
            <div className={styles.caseCard}>
              <h3>🏥 Клиника</h3>
              <p>-30% неявок на приём</p>
              <span className={styles.caseMeta}>Авто-напоминания • 10 дней</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Как это работает</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <h3>Расчёт проекта</h3>
              <p>Заполняете бриф за 5 минут</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <h3>Сценарий</h3>
              <p>Проектируем логику бота</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <h3>Интеграция</h3>
              <p>Подключаем CRM и аналитику</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <h3>Запуск</h3>
              <p>Тестируем и запускаем</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 ChatBot24 Studio. Все права защищены.</p>
        <p>
          <a href="https://t.me/ChatBot24su_bot">@ChatBot24su_bot</a>
        </p>
      </footer>
    </div>
  );
}
