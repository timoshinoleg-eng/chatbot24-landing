/**
 * ChatBot24 Studio — Hero Interactive Widget
 * Интерактивный виджет чата для Hero-секции
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        botUsername: 'ChatBot24su_bot',
        inactivityTimeout: 15000,
        abTestVariant: getABTestVariant(),
        utmParams: getUTMParams()
    };

    // Widget state
    let widgetState = {
        step: 1,
        selectedGoal: null,
        interactionStarted: false,
        inactivityTimer: null
    };

    // A/B Test Variants
    const AB_VARIANTS = {
        A: {
            firstQuestion: 'Какая задача сейчас приоритетна?',
            options: [
                { id: 'sales', text: '💰 Больше продаж' },
                { id: 'automation', text: '⚙️ Автоматизация' },
                { id: 'workload', text: '📉 Снижение нагрузки' },
                { id: 'looking', text: '👀 Просто смотрю' }
            ]
        },
        B: {
            firstQuestion: 'Сколько заявок обрабатываете вручную?',
            options: [
                { id: 'few', text: '📊 до 100' },
                { id: 'medium', text: '📊 100–500' },
                { id: 'many', text: '📊 500+' },
                { id: 'notrack', text: '❓ Не отслеживаю' }
            ]
        },
        C: {
            firstQuestion: 'Хотите рассчитать экономию от бота?',
            options: [
                { id: 'yes', text: '✅ Да, покажите расчёт' },
                { id: 'maybe', text: '🤔 Сначала расскажите' },
                { id: 'demo', text: '🎮 Хочу демо' },
                { id: 'later', text: '⏰ Не сейчас' }
            ]
        }
    };

    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source') || 'hero_site',
            medium: params.get('utm_medium') || 'website',
            campaign: params.get('utm_campaign') || 'main'
        };
    }

    function getABTestVariant() {
        let variant = localStorage.getItem('chatbot24_ab_variant');
        if (!variant || !AB_VARIANTS[variant]) {
            const variants = ['A', 'B', 'C'];
            variant = variants[Math.floor(Math.random() * variants.length)];
            localStorage.setItem('chatbot24_ab_variant', variant);
        }
        return variant;
    }

    function trackEvent(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, { ...params, ab_variant: CONFIG.abTestVariant });
        }
        if (typeof ym !== 'undefined') {
            ym(CONFIG.ymCounterId || 'XXXXXX', 'reachGoal', eventName, params);
        }
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: eventName,
                params: { ...params, variant: CONFIG.abTestVariant },
                clientId: getClientId()
            })
        }).catch(() => {});
    }

    function getClientId() {
        let clientId = localStorage.getItem('chatbot24_client_id');
        if (!clientId) {
            clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            localStorage.setItem('chatbot24_client_id', clientId);
        }
        return clientId;
    }

    // Create widget content HTML
    function createWidgetContent() {
        const variant = AB_VARIANTS[CONFIG.abTestVariant];
        return `
            <div class="hero-widget-messages" id="widget-messages">
                <div class="hero-widget-message hero-widget-message--bot">
                    <div class="hero-widget-bubble">
                        Здравствуйте.<br>
                        Покажу, как бот увеличивает конверсию за 30 секунд.<br><br>
                        ${variant.firstQuestion}
                    </div>
                </div>
            </div>
            <div class="hero-widget-typing" id="widget-typing" style="display: none;">
                <span></span><span></span><span></span>
            </div>
            <div class="hero-widget-buttons" id="widget-buttons">
                ${variant.options.map(opt => `
                    <button class="hero-widget-btn" data-value="${opt.id}">${opt.text}</button>
                `).join('')}
            </div>
        `;
    }

    function showTyping() {
        const typing = document.getElementById('widget-typing');
        if (typing) typing.style.display = 'flex';
    }

    function hideTyping() {
        const typing = document.getElementById('widget-typing');
        if (typing) typing.style.display = 'none';
    }

    function addMessage(text, isUser = false, delay = 0) {
        const messagesContainer = document.getElementById('widget-messages');
        if (!messagesContainer) return;

        const appendMessage = () => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `hero-widget-message hero-widget-message--${isUser ? 'user' : 'bot'}`;
            messageDiv.innerHTML = `<div class="hero-widget-bubble">${text.replace(/\n/g, '<br>')}</div>`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        if (delay > 0) {
            showTyping();
            setTimeout(() => { hideTyping(); appendMessage(); }, delay);
        } else {
            appendMessage();
        }
    }

    function updateButtons(buttons) {
        const buttonsContainer = document.getElementById('widget-buttons');
        if (!buttonsContainer) return;
        buttonsContainer.innerHTML = buttons.map(btn => `
            <button class="hero-widget-btn" data-value="${btn.id}">${btn.text}</button>
        `).join('');
        attachButtonListeners();
    }

    function getStep2Response(goal) {
        const responses = {
            sales: `Отлично.\nБот может:\n• Квалифицировать лида\n• Собирать контакты\n• Передавать в CRM\n\nСредний рост конверсии — 22–37%.\n\nХотите увидеть расчёт под ваш бизнес?`,
            automation: `Правильный выбор.\nАвтоматизация экономит:\n• 40–70 часов менеджера в месяц\n• До 60% на ФОТ\n\nХотите рассчитать экономию?`,
            workload: `Понимаю.\nБот обрабатывает до 80% \nрутинных вопросов 24/7.\n\nОсвободите команду для сложных задач?`,
            looking: `Без проблем.\nПокажу реальный кейс:\nВ нише услуг бот увеличил \nзаявки на 31% за 2 месяца.\n\nИнтересно узнать детали?`,
            few: `Отличный старт!\nДаже с небольшим объёмом бот \nуже приносит пользу:\n• Экономит 5-10 часов в неделю\n• Ни одна заявка не потеряна\n\nХотите увидеть расчёт?`,
            medium: `Значимый объём!\nНа 100–200 заявках ручная \nобработка занимает много времени.\n\nБот сэкономит 20-40 часов в месяц.\nПосчитаем точнее?`,
            many: `Впечатляющий масштаб!\nБолее 200 заявок без автоматизации — \nэто потерянные лиды и выгорание команды.\n\nБот масштабируется бесконечно.\nРассчитаем ROI?`,
            notrack: `Понимаю!\nМногие так же начинали.\n\nС ботом вы увидите полную картину:\n• Сколько заявок приходит\n• Какие вопросы задают\n• Где теряются клиенты\n\nХотите систему контроля?`,
            yes: `Отлично! Перейдём к расчёту.\n\nВсего 4 вопроса — и вы получите:\n• Архитектуру сценария\n• Смету проекта\n• План внедрения\n\nГотовы начать?`,
            maybe: `Конечно!\n\nChatBot24 Studio создаёт ботов для:\n• Продаж и воронок\n• Поддержки клиентов\n• Записи и бронирования\n• Интеграции с CRM\n\nКакое направление интересует?`,
            demo: `Отличный выбор!\n\nДемо покажет, как бот работает \nна примере вашей ниши:\n• Недвижимость\n• Онлайн-образование\n• Услуги / Клиника\n\nКакая ниша ближе?`,
            later: `Понимаю! Сохраню ссылку.\n\nКогда будете готовы — бот всегда\nдоступен в Telegram:\n@${CONFIG.botUsername}\n\nХотите получить короткое\nвведение в возможности?`
        };
        return responses[goal] || responses.sales;
    }

    function handleButtonClick(value) {
        if (!widgetState.interactionStarted) {
            widgetState.interactionStarted = true;
            trackEvent('hero_interaction_start', { variant: CONFIG.abTestVariant, first_selection: value });
        }

        const variant = AB_VARIANTS[CONFIG.abTestVariant];
        const option = variant.options.find(opt => opt.id === value);
        addMessage(option.text, true);
        widgetState.selectedGoal = value;
        clearTimeout(widgetState.inactivityTimer);

        setTimeout(() => {
            const response = getStep2Response(value);
            addMessage(response, false, 300);
            setTimeout(() => {
                updateButtons([
                    { id: 'telegram', text: '🚀 Перейти в Telegram' },
                    { id: 'cases', text: '📂 Смотреть кейсы' }
                ]);
                widgetState.step = 2;
            }, 100);
        }, 500);

        trackEvent('hero_widget_step1_complete', { selection: value });
    }

    function handleStep2Click(value) {
        if (value === 'telegram') {
            trackEvent('hero_to_telegram_click', { utm_source: 'hero_site', variant: CONFIG.abTestVariant });
            const startParam = encodeURIComponent(`hero_${widgetState.selectedGoal || 'unknown'}`);
            window.open(`https://t.me/${CONFIG.botUsername}?start=${startParam}`, '_blank');
        } else if (value === 'cases') {
            trackEvent('hero_to_cases_click', { variant: CONFIG.abTestVariant });
            window.location.href = '/cases';
        }
    }

    function attachButtonListeners() {
        document.querySelectorAll('.hero-widget-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const value = this.dataset.value;
                if (widgetState.step === 1) {
                    handleButtonClick(value);
                } else {
                    handleStep2Click(value);
                }
            });
        });
    }

    function showInactivityPopup() {
        if (widgetState.interactionStarted) return;
        
        // Remove existing popup if any
        const existingPopup = document.getElementById('inactivity-popup');
        if (existingPopup) existingPopup.remove();
        
        const popup = document.createElement('div');
        popup.className = 'hero-widget-popup';
        popup.id = 'inactivity-popup';
        popup.innerHTML = `
            <div class="hero-widget-popup-content">
                <p>Показать, как бот может<br>обрабатывать заявки 24/7?</p>
                <button class="hero-widget-popup-btn">Показать</button>
            </div>
        `;
        document.body.appendChild(popup);
        
        setTimeout(() => popup.classList.add('is-visible'), 10);
        
        popup.querySelector('button').addEventListener('click', () => {
            popup.classList.remove('is-visible');
            setTimeout(() => popup.remove(), 300);
            const container = document.getElementById('hero-widget-container');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                trackEvent('hero_inactivity_popup_click');
            }
        });
        
        trackEvent('hero_inactivity_popup_shown');
    }

    function init() {
        const body = document.getElementById('hero-widget-body');
        if (!body) {
            console.error('Hero widget body not found');
            return;
        }
        
        // Fill the existing body with content
        body.innerHTML = createWidgetContent();
        
        attachButtonListeners();
        
        widgetState.inactivityTimer = setTimeout(showInactivityPopup, CONFIG.inactivityTimeout);
        
        trackEvent('hero_widget_view', { variant: CONFIG.abTestVariant });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ChatBot24Widget = {
        getVariant: () => CONFIG.abTestVariant,
        trackEvent: trackEvent,
        reset: () => { 
            widgetState.step = 1; 
            widgetState.selectedGoal = null; 
            widgetState.interactionStarted = false;
            init();
        }
    };
})();
