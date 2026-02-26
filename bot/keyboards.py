"""
ChatBot24 Studio - Bot Keyboards
"""
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


def get_main_menu() -> InlineKeyboardMarkup:
    """Главное меню бота"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📊 Рассчитать проект", callback_data="calc_start"),
        ],
        [
            InlineKeyboardButton(text="🎮 Демо-режим", callback_data="demo_start"),
        ],
        [
            InlineKeyboardButton(text="💼 Кейсы и цифры", callback_data="cases"),
        ],
        [
            InlineKeyboardButton(text="❓ Вопрос менеджеру", callback_data="support"),
        ],
    ])


def get_back_to_menu() -> InlineKeyboardMarkup:
    """Кнопка возврата в меню"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu")]
    ])


# === ВЕТКА РАСЧЕТА ПРОЕКТА ===

def get_calc_step1_task() -> InlineKeyboardMarkup:
    """Шаг 1: Выбор задачи"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💰 Продажи / Воронки", callback_data="calc_task:sales"),
        ],
        [
            InlineKeyboardButton(text="🎧 Поддержка / FAQ", callback_data="calc_task:support"),
        ],
        [
            InlineKeyboardButton(text="📅 Запись / Бронирование", callback_data="calc_task:booking"),
        ],
        [
            InlineKeyboardButton(text="🔗 Интеграция с CRM", callback_data="calc_task:crm"),
        ],
        [
            InlineKeyboardButton(text="🤖 Другое", callback_data="calc_task:other"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


def get_calc_step2_scale() -> InlineKeyboardMarkup:
    """Шаг 2: Масштаб"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📉 до 100", callback_data="calc_scale:100"),
        ],
        [
            InlineKeyboardButton(text="📊 100–500", callback_data="calc_scale:500"),
        ],
        [
            InlineKeyboardButton(text="📈 500+", callback_data="calc_scale:500plus"),
        ],
        [
            InlineKeyboardButton(text="⬅️ Назад", callback_data="calc_back:1"),
        ],
    ])


def get_calc_step3_timeline() -> InlineKeyboardMarkup:
    """Шаг 3: Срок"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="⚡ До 30 дней", callback_data="calc_time:30"),
        ],
        [
            InlineKeyboardButton(text="📅 1–3 месяца", callback_data="calc_time:90"),
        ],
        [
            InlineKeyboardButton(text="🔍 Изучаю рынок", callback_data="calc_time:research"),
        ],
        [
            InlineKeyboardButton(text="⬅️ Назад", callback_data="calc_back:2"),
        ],
    ])


def get_calc_step4_contact() -> InlineKeyboardMarkup:
    """Шаг 4: Контакт"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📱 Поделиться контактом", callback_data="calc_contact:share"),
        ],
        [
            InlineKeyboardButton(text="✍️ Ввести вручную", callback_data="calc_contact:manual"),
        ],
        [
            InlineKeyboardButton(text="⬅️ Назад", callback_data="calc_back:3"),
        ],
    ])


def get_calc_final() -> InlineKeyboardMarkup:
    """Финал расчета"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📝 Заполнить бриф", url="https://www.chatbot24.su/brief"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


def get_reminder_buttons() -> InlineKeyboardMarkup:
    """Кнопки напоминания"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📝 Перейти к брифу", url="https://www.chatbot24.su/brief"),
        ],
        [
            InlineKeyboardButton(text="❌ Не актуально", callback_data="reminder_dismiss"),
        ],
    ])


# === ВЕТКА ДЕМО ===

def get_demo_start() -> InlineKeyboardMarkup:
    """Выбор ниши для демо"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🏢 Недвижимость", callback_data="demo:realestate"),
        ],
        [
            InlineKeyboardButton(text="🎓 Онлайн-школа", callback_data="demo:education"),
        ],
        [
            InlineKeyboardButton(text="🏥 Услуги / Клиника", callback_data="demo:clinic"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


def get_demo_realestate_step1() -> InlineKeyboardMarkup:
    """Демо Недвижимость - Шаг 1"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="до 10 млн ₽", callback_data="demo_re:10m"),
        ],
        [
            InlineKeyboardButton(text="10–20 млн ₽", callback_data="demo_re:20m"),
        ],
        [
            InlineKeyboardButton(text="20+ млн ₽", callback_data="demo_re:20plus"),
        ],
        [
            InlineKeyboardButton(text="⬅️ Выход", callback_data="main_menu"),
        ],
    ])


def get_demo_realestate_step2() -> InlineKeyboardMarkup:
    """Демо Недвижимость - Шаг 2"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Центральный", callback_data="demo_re:central"),
        ],
        [
            InlineKeyboardButton(text="Спальный район", callback_data="demo_re:sleep"),
        ],
        [
            InlineKeyboardButton(text="Пригород", callback_data="demo_re:suburb"),
        ],
        [
            InlineKeyboardButton(text="⬅️ Назад", callback_data="demo:realestate"),
        ],
    ])


def get_demo_realestate_step3() -> InlineKeyboardMarkup:
    """Демо Недвижимость - Шаг 3"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Ипотека", callback_data="demo_re:ipoteka"),
        ],
        [
            InlineKeyboardButton(text="Наличные", callback_data="demo_re:cash"),
        ],
        [
            InlineKeyboardButton(text="Рассрочка", callback_data="demo_re:rassrochka"),
        ],
        [
            InlineKeyboardButton(text="⬅️ Назад", callback_data="demo_re:step2"),
        ],
    ])


def get_demo_final() -> InlineKeyboardMarkup:
    """Финал демо"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📊 Рассчитать для моего бизнеса", callback_data="calc_start"),
        ],
        [
            InlineKeyboardButton(text="💼 Другие кейсы", callback_data="cases"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


# === ВЕТКА КЕЙСЫ ===

def get_cases_buttons() -> InlineKeyboardMarkup:
    """Кнопки кейсов"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💼 Все кейсы на сайте", url="https://www.chatbot24.su/cases"),
        ],
        [
            InlineKeyboardButton(text="📊 Рассчитать мой проект", callback_data="calc_start"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


# === ВЕТКА ПОДДЕРЖКА ===

def get_support_buttons() -> InlineKeyboardMarkup:
    """Кнопки поддержки"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📞 Заказать звонок", callback_data="support_call"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


def get_escalation_buttons() -> InlineKeyboardMarkup:
    """Кнопки эскалации"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="👨‍💼 Позвать менеджера", callback_data="escalation_manager"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


# === ВЕТКА СОТРУДНИЧЕСТВО ===

def get_partnership_buttons() -> InlineKeyboardMarkup:
    """Кнопки сотрудничества"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🤝 Партнерство", callback_data="partner:partnership"),
        ],
        [
            InlineKeyboardButton(text="📝 Субподряд", callback_data="partner:subcontract"),
        ],
        [
            InlineKeyboardButton(text="📢 Реклама", callback_data="partner:ads"),
        ],
        [
            InlineKeyboardButton(text="💼 Вакансии", callback_data="partner:jobs"),
        ],
        [
            InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
        ],
    ])


# === ОБРАБОТКА ОШИБОК ===

def get_unrecognized_1st() -> InlineKeyboardMarkup:
    """Первое нераспознанное сообщение"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📊 Рассчитать проект", callback_data="calc_start"),
        ],
        [
            InlineKeyboardButton(text="🎮 Демо-режим", callback_data="demo_start"),
        ],
        [
            InlineKeyboardButton(text="💼 Кейсы", callback_data="cases"),
        ],
        [
            InlineKeyboardButton(text="❓ Вопрос менеджеру", callback_data="support"),
        ],
    ])


def get_smart_reply_buttons(keywords: str) -> InlineKeyboardMarkup:
    """Умные кнопки на основе ключевых слов"""
    if "цена" in keywords or "стоимость" in keywords or "тариф" in keywords:
        return InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="📝 Заполнить бриф", url="https://www.chatbot24.su/brief"),
            ],
            [
                InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
            ],
        ])
    elif "срок" in keywords or "когда" in keywords or "быстро" in keywords:
        return InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="📊 Рассчитать проект", callback_data="calc_start"),
            ],
            [
                InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
            ],
        ])
    elif "кейс" in keywords or "пример" in keywords or "портфолио" in keywords:
        return InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="💼 Кейсы", callback_data="cases"),
            ],
            [
                InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu"),
            ],
        ])
    else:
        return get_back_to_menu()
