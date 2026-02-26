"""
ChatBot24 Studio - Bot Handlers
"""
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Optional

from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery, Contact
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from keyboards import *
from config import config


router = Router()


# === STATES ===

class CalculationState(StatesGroup):
    """Состояния для расчета проекта"""
    task = State()
    scale = State()
    timeline = State()
    contact = State()
    phone = State()


class SupportState(StatesGroup):
    """Состояния для поддержки"""
    question = State()
    waiting = State()


class DemoState(StatesGroup):
    """Состояния для демо"""
    niche = State()
    step1 = State()
    step2 = State()
    step3 = State()


# === HELPERS ===

async def show_typing(bot: Bot, chat_id: int):
    """Показать индикатор набора текста"""
    await bot.send_chat_action(chat_id=chat_id, action="typing")
    await asyncio.sleep(config.TYPING_DELAY)


def calculate_lead_score(task: str, scale: str, timeline: str, has_contact: bool = False, demo_completed: bool = False, brief_sent: bool = False) -> int:
    """Расчет скоринга лида"""
    score = 0
    
    # По сроку
    if timeline == "30":
        score += 40
    elif timeline == "90":
        score += 20
    elif timeline == "research":
        score += 5
    
    # По масштабу
    if scale == "500plus":
        score += 20
    elif scale == "500":
        score += 10
    
    # Дополнительно
    if has_contact:
        score += 20
    if demo_completed:
        score += 15
    if brief_sent:
        score += 30
    
    return min(score, 100)


def get_lead_tag(score: int) -> str:
    """Определить тег по скорингу"""
    if score >= config.SCORE_HOT:
        return "Lead_Hot"
    elif score >= config.SCORE_WARM:
        return "Lead_Warm"
    else:
        return "Lead_Cold"


async def save_lead_to_supabase(lead_data: dict) -> dict:
    """Отправить данные лида в Supabase через API"""
    try:
        # URL вашего API endpoint на Vercel
        api_url = "https://chatbot24-landing.vercel.app/api/webhook"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(api_url, json=lead_data) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"HTTP {response.status}"}
    except Exception as e:
        return {"error": str(e)}


async def notify_manager_about_hot_lead(bot: Bot, user_id: int, phone: str, lead_data: dict):
    """Отправить уведомление менеджеру о Hot Lead"""
    if not config.ADMIN_ID:
        return
    
    tag = get_lead_tag(lead_data.get("lead_score", 0))
    
    # Отправляем уведомление только для Hot Lead
    if tag != "Lead_Hot":
        return
    
    # Map codes to readable text
    timeline_map = {
        "30": "До 30 дней",
        "90": "1–3 месяца",
        "research": "Изучаю рынок"
    }
    
    scale_map = {
        "100": "до 100",
        "500": "100–500",
        "500plus": "500+"
    }
    
    task_map = {
        "sales": "Продажи / Воронки",
        "support": "Поддержка / FAQ",
        "booking": "Запись / Бронирование",
        "crm": "Интеграция с CRM",
        "other": "Другое"
    }
    
    message = f"""🔥 Hot Lead!

👤 Telegram ID: {user_id}
📱 Телефон: {phone}
📋 Задача: {task_map.get(lead_data.get('lead_task'), lead_data.get('lead_task', 'Не указана'))}
📊 Объём: {scale_map.get(lead_data.get('lead_scale'), lead_data.get('lead_scale', 'Не указан'))} заявок/мес
⏰ Срок: {timeline_map.get(lead_data.get('lead_timeline'), lead_data.get('lead_timeline', 'Не указан'))}
⭐ Оценка: {lead_data.get('lead_score', 0)}/100
🏷 Тег: {tag}

🔗 Источник: {lead_data.get('source', 'telegram_bot')}
📍 UTM: {lead_data.get('utm_source', 'N/A')}"""
    
    try:
        await bot.send_message(
            chat_id=config.ADMIN_ID,
            text=message
        )
    except Exception as e:
        print(f"Failed to notify manager: {e}")


# === START & MAIN MENU ===

@router.message(CommandStart())
async def cmd_start(message: Message, bot: Bot):
    """Обработка команды /start"""
    await show_typing(bot, message.chat.id)
    
    text = f"""{message.from_user.first_name}, приветствую.

ChatBot24 Studio.
Проектируем и внедряем ботов для продаж и автоматизации.

Этот бот — реальный пример нашей работы:
⚡ Мгновенная логика
🎯 Квалификация лидов
🔗 Интеграция с CRM

Выберите действие:"""
    
    await message.answer(text, reply_markup=get_main_menu())


@router.callback_query(F.data == "main_menu")
async def main_menu(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Возврат в главное меню"""
    await state.clear()
    await callback.message.edit_text("Главное меню:", reply_markup=get_main_menu())
    await callback.answer()


# === РАСЧЕТ ПРОЕКТА ===

@router.callback_query(F.data == "calc_start")
async def calc_start(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Начало расчета проекта"""
    await show_typing(bot, callback.message.chat.id)
    
    text = """[Шаг 1 из 4]
Какая цель приоритетна?"""
    
    await callback.message.edit_text(text, reply_markup=get_calc_step1_task())
    await state.set_state(CalculationState.task)
    await callback.answer()


@router.callback_query(F.data.startswith("calc_task:"))
async def calc_task(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Выбор задачи"""
    task = callback.data.split(":")[1]
    await state.update_data(task=task)
    
    task_names = {
        "sales": "Продажи / Воронки",
        "support": "Поддержка / FAQ",
        "booking": "Запись / Бронирование",
        "crm": "Интеграция с CRM",
        "other": "Другое"
    }
    
    await show_typing(bot, callback.message.chat.id)
    
    text = f"""[Шаг 2 из 4]
Сколько заявок в месяц планируете обрабатывать?
Это влияет на архитектуру и нагрузку."""
    
    await callback.message.edit_text(text, reply_markup=get_calc_step2_scale())
    await state.set_state(CalculationState.scale)
    await callback.answer()


@router.callback_query(F.data.startswith("calc_scale:"))
async def calc_scale(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Выбор масштаба"""
    scale = callback.data.split(":")[1]
    await state.update_data(scale=scale)
    
    await show_typing(bot, callback.message.chat.id)
    
    text = """[Шаг 3 из 4]
Когда планируете запуск?"""
    
    await callback.message.edit_text(text, reply_markup=get_calc_step3_timeline())
    await state.set_state(CalculationState.timeline)
    await callback.answer()


@router.callback_query(F.data.startswith("calc_time:"))
async def calc_timeline(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Выбор срока"""
    timeline = callback.data.split(":")[1]
    await state.update_data(timeline=timeline)
    
    # Определяем тег
    if timeline == "30":
        tag = "Lead_Hot"
    elif timeline == "90":
        tag = "Lead_Warm"
    else:
        tag = "Lead_Cold"
    
    await state.update_data(tag=tag)
    
    await show_typing(bot, callback.message.chat.id)
    
    text = """[Шаг 4 из 4]
Подготовим для вас:
• Архитектуру сценариев
• Смету
• План интеграций

Укажите контакт для связи. Менеджер пришлет КП."""
    
    await callback.message.edit_text(text, reply_markup=get_calc_step4_contact())
    await state.set_state(CalculationState.contact)
    await callback.answer()


@router.callback_query(F.data.startswith("calc_contact:"), CalculationState.contact)
async def calc_contact(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Выбор способа контакта"""
    method = callback.data.split(":")[1]
    
    if method == "share":
        # Запросить контакт через ReplyKeyboard
        from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
        
        kb = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="📱 Поделиться контактом", request_contact=True)]],
            resize_keyboard=True,
            one_time_keyboard=True
        )
        
        await callback.message.answer(
            "Нажмите кнопку ниже, чтобы поделиться контактом:",
            reply_markup=kb
        )
        await state.set_state(CalculationState.phone)
    else:
        await callback.message.answer(
            "Введите ваш телефон или @username:",
            reply_markup=get_back_to_menu()
        )
        await state.set_state(CalculationState.phone)
    
    await callback.answer()


@router.message(CalculationState.phone)
async def calc_phone_manual(message: Message, bot: Bot, state: FSMContext):
    """Получение телефона вручную"""
    phone = message.text
    await state.update_data(phone=phone, contact_received=True)
    
    # Получаем все данные
    data = await state.get_data()
    
    # Рассчитываем скоринг
    score = calculate_lead_score(
        task=data.get("task", ""),
        scale=data.get("scale", ""),
        timeline=data.get("timeline", ""),
        has_contact=True
    )
    
    # Формируем данные для Supabase (НЕТ name и phone!)
    lead_data = {
        "user_id": message.from_user.id,
        "lead_task": data.get("task", ""),
        "lead_scale": data.get("scale", ""),
        "lead_timeline": data.get("timeline", ""),
        "lead_score": score,
        "source": "telegram_bot",
        "utm_source": "",
        "contact_received": True,
        "tags": get_lead_tag(score),
        "status": "new"
    }
    
    # Сохраняем в Supabase
    result = await save_lead_to_supabase(lead_data)
    print(f"Lead saved to Supabase: {result}")
    
    # Отправляем уведомление менеджеру о Hot Lead (с телефоном!)
    await notify_manager_about_hot_lead(bot, message.from_user.id, phone, lead_data)
    
    await show_typing(bot, message.chat.id)
    
    text = """Контакт сохранен.
Заполните бриф (5 минут).
После отправки — подготовим КП в течение 24 часов.

Сейчас в работе 12 проектов. 
Средний срок запуска — 10 дней."""
    
    await message.answer(text, reply_markup=get_calc_final())
    await state.clear()


@router.message(CalculationState.phone, F.contact)
async def calc_phone_contact(message: Message, bot: Bot, state: FSMContext):
    """Получение контакта через Telegram"""
    contact: Contact = message.contact
    phone = contact.phone_number
    
    await state.update_data(phone=phone, contact_received=True)
    
    # Получаем все данные
    data = await state.get_data()
    
    # Рассчитываем скоринг
    score = calculate_lead_score(
        task=data.get("task", ""),
        scale=data.get("scale", ""),
        timeline=data.get("timeline", ""),
        has_contact=True
    )
    
    # Формируем данные для Supabase (НЕТ name и phone!)
    lead_data = {
        "user_id": message.from_user.id,
        "lead_task": data.get("task", ""),
        "lead_scale": data.get("scale", ""),
        "lead_timeline": data.get("timeline", ""),
        "lead_score": score,
        "source": "telegram_bot",
        "utm_source": "",
        "contact_received": True,
        "tags": get_lead_tag(score),
        "status": "new"
    }
    
    # Сохраняем в Supabase
    result = await save_lead_to_supabase(lead_data)
    print(f"Lead saved to Supabase: {result}")
    
    # Отправляем уведомление менеджеру о Hot Lead (с телефоном!)
    await notify_manager_about_hot_lead(bot, message.from_user.id, phone, lead_data)
    
    await show_typing(bot, message.chat.id)
    
    text = """Контакт сохранен.
Заполните бриф (5 минут).
После отправки — подготовим КП в течение 24 часов.

Сейчас в работе 12 проектов. 
Средний срок запуска — 10 дней."""
    
    await message.answer(text, reply_markup=get_calc_final())
    await state.clear()


@router.callback_query(F.data.startswith("calc_back:"))
async def calc_back(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Назад в расчете"""
    step = int(callback.data.split(":")[1])
    
    if step == 1:
        await calc_start(callback, bot, state)
    elif step == 2:
        await show_typing(bot, callback.message.chat.id)
        text = """[Шаг 2 из 4]
Сколько заявок в месяц планируете обрабатывать?
Это влияет на архитектуру и нагрузку."""
        await callback.message.edit_text(text, reply_markup=get_calc_step2_scale())
        await state.set_state(CalculationState.scale)
    elif step == 3:
        await show_typing(bot, callback.message.chat.id)
        text = """[Шаг 3 из 4]
Когда планируете запуск?"""
        await callback.message.edit_text(text, reply_markup=get_calc_step3_timeline())
        await state.set_state(CalculationState.timeline)
    
    await callback.answer()


# === ДЕМО-РЕЖИМ ===

@router.callback_query(F.data == "demo_start")
async def demo_start(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Начало демо"""
    await show_typing(bot, callback.message.chat.id)
    
    text = """Выберите нишу для симуляции.
Вы пройдете путь клиента вашего будущего бота.
Это займёт 2–3 минуты."""
    
    await callback.message.edit_text(text, reply_markup=get_demo_start())
    await state.set_state(DemoState.niche)
    await callback.answer()


@router.callback_query(F.data.startswith("demo:"))
async def demo_niche(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Выбор ниши"""
    niche = callback.data.split(":")[1]
    await state.update_data(niche=niche)
    
    if niche == "realestate":
        await show_typing(bot, callback.message.chat.id)
        text = """🏠 Демо-режим: Недвижимость
Вы — клиент. Я — бот агентства.
Подберем квартиру.

Вопрос 1 из 3:
Какой бюджет?"""
        await callback.message.edit_text(text, reply_markup=get_demo_realestate_step1())
        await state.set_state(DemoState.step1)
    
    elif niche == "education":
        await show_typing(bot, callback.message.chat.id)
        text = """🎓 Демо-режим: Онлайн-образование
Вы — потенциальный студент.
Подберем программу.

Вопрос 1 из 3:
Какую цель хотите достичь?"""
        
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Новая профессия", callback_data="demo_ed:prof")],
            [InlineKeyboardButton(text="Повышение квалификации", callback_data="demo_ed:upgrade")],
            [InlineKeyboardButton(text="Дополнительный доход", callback_data="demo_ed:income")],
            [InlineKeyboardButton(text="⬅️ Выход", callback_data="main_menu")],
        ])
        await callback.message.edit_text(text, reply_markup=kb)
        await state.set_state(DemoState.step1)
    
    elif niche == "clinic":
        await show_typing(bot, callback.message.chat.id)
        text = """🏥 Демо-режим: Услуги / Клиника
Вы — пациент.
Запишемся на приём.

Вопрос 1 из 3:
Какая услуга нужна?"""
        
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Консультация", callback_data="demo_cl:consult")],
            [InlineKeyboardButton(text="Диагностика", callback_data="demo_cl:diag")],
            [InlineKeyboardButton(text="Повторный приём", callback_data="demo_cl:repeat")],
            [InlineKeyboardButton(text="⬅️ Выход", callback_data="main_menu")],
        ])
        await callback.message.edit_text(text, reply_markup=kb)
        await state.set_state(DemoState.step1)
    
    await callback.answer()


@router.callback_query(F.data.startswith("demo_re:"), DemoState.step1)
async def demo_re_step2(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Демо недвижимость - шаг 2"""
    await state.update_data(re_budget=callback.data.split(":")[1])
    
    await show_typing(bot, callback.message.chat.id)
    text = """Вопрос 2 из 3:
Какой район интересует?"""
    
    await callback.message.edit_text(text, reply_markup=get_demo_realestate_step2())
    await state.set_state(DemoState.step2)
    await callback.answer()


@router.callback_query(F.data.startswith("demo_re:"), DemoState.step2)
async def demo_re_step3(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Демо недвижимость - шаг 3"""
    await state.update_data(re_district=callback.data.split(":")[1])
    
    await show_typing(bot, callback.message.chat.id)
    text = """Вопрос 3 из 3:
Способ оплаты?"""
    
    await callback.message.edit_text(text, reply_markup=get_demo_realestate_step3())
    await state.set_state(DemoState.step3)
    await callback.answer()


@router.callback_query(F.data.startswith("demo_re:"), DemoState.step3)
async def demo_re_final(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Финал демо недвижимости"""
    await state.update_data(re_payment=callback.data.split(":")[1], demo_completed=True)
    
    await show_typing(bot, callback.message.chat.id)
    
    text = """✅ Сценарий завершён.

Что произошло «под капотом»:
• Лид квалифицирован
• Сегмент сохранён в CRM
• Менеджер получил уведомление

Эффект в реальных проектах:
📈 +37% квалифицированных заявок
⏳ -60% времени на опрос

Хотите так же для своего бизнеса?"""
    
    await callback.message.edit_text(text, reply_markup=get_demo_final())
    await state.clear()
    await callback.answer()


# === КЕЙСЫ ===

@router.callback_query(F.data == "cases")
async def cases_handler(callback: CallbackQuery, bot: Bot):
    """Показать кейсы"""
    await show_typing(bot, callback.message.chat.id)
    
    text = """Реальные результаты внедрений:

🏢 Недвижимость (Москва)
• +37% квалифицированных лидов
• Интеграция с AmoCRM
• Срок запуска: 12 дней

🛒 Telegram-магазин
• Оплата внутри бота (ЮKassa)
• Синхронизация склада (1С)
• Срок запуска: 18 дней

🏥 Клиника (Москва)
• -30% неявок на приём
• Авто-напоминания 24/7
• Срок запуска: 10 дней

Хотите посмотреть все кейсы?"""
    
    await callback.message.edit_text(text, reply_markup=get_cases_buttons())
    await callback.answer()


# === ПОДДЕРЖКА ===

@router.callback_query(F.data == "support")
async def support_start(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Начало поддержки"""
    await show_typing(bot, callback.message.chat.id)
    
    text = """Напишите вопрос одним сообщением.

Среднее время ответа: 1–2 часа
(в рабочее время: 9:00–20:00 МСК)"""
    
    await callback.message.edit_text(text, reply_markup=get_back_to_menu())
    await state.set_state(SupportState.question)
    await callback.answer()


@router.message(SupportState.question)
async def support_question(message: Message, bot: Bot, state: FSMContext):
    """Обработка вопроса"""
    question = message.text.lower()
    
    # Умная классификация
    if any(word in question for word in ["цена", "сколько", "стоимость", "тариф"]):
        await show_typing(bot, message.chat.id)
        await message.answer(
            "Стоимость зависит от архитектуры. Для точного расчета заполните бриф.",
            reply_markup=get_smart_reply_buttons("цена")
        )
    elif any(word in question for word in ["срок", "когда", "быстро"]):
        await show_typing(bot, message.chat.id)
        await message.answer(
            "Средний срок запуска — 10–14 дней. Срочные проекты обсуждаем индивидуально.",
            reply_markup=get_smart_reply_buttons("срок")
        )
    elif any(word in question for word in ["кейс", "пример", "портфолио"]):
        await show_typing(bot, message.chat.id)
        await message.answer(
            "Посмотрите все кейсы на сайте.",
            reply_markup=get_smart_reply_buttons("кейс")
        )
    else:
        # Создать тикет
        ticket_id = f"TKT{message.from_user.id}{datetime.now().strftime('%H%M')}"
        
        await show_typing(bot, message.chat.id)
        await message.answer(
            f"""Вопрос принят в работу.
ID заявки: #{ticket_id}
Менеджер уже уведомлен.
Ожидайте ответ в ближайшее время.""",
            reply_markup=get_support_buttons()
        )
        
        # TODO: Отправить уведомление менеджеру
        print(f"New support ticket #{ticket_id}: {message.text}")
    
    await state.clear()


# === ОБРАБОТКА ОШИБОК ===

@router.message(F.text)
async def unrecognized_message(message: Message, bot: Bot, state: FSMContext):
    """Обработка нераспознанных сообщений"""
    data = await state.get_data()
    unrecognized_count = data.get("unrecognized_count", 0) + 1
    
    if unrecognized_count == 1:
        await state.update_data(unrecognized_count=1)
        await show_typing(bot, message.chat.id)
        await message.answer(
            "Чтобы я не ошибся, выберите пункт в меню.\nЭто ускорит обработку вашего запроса.",
            reply_markup=get_unrecognized_1st()
        )
    else:
        await state.update_data(unrecognized_count=2)
        await show_typing(bot, message.chat.id)
        await message.answer(
            "Кажется, у вас нестандартный запрос.\nПодключу менеджера для помощи.",
            reply_markup=get_escalation_buttons()
        )


@router.callback_query(F.data == "escalation_manager")
async def call_manager(callback: CallbackQuery, bot: Bot, state: FSMContext):
    """Вызов менеджера"""
    await show_typing(bot, callback.message.chat.id)
    
    # TODO: Отправить уведомление менеджеру
    print(f"ESCALATION: User {callback.from_user.id} requested manager")
    
    await callback.message.edit_text(
        "👨‍💼 Менеджер скоро свяжется с вами.\n\nОбычно это занимает 15-30 минут.",
        reply_markup=get_back_to_menu()
    )
    await state.clear()
    await callback.answer()


# === ПАРТНЕРСТВО ===

@router.callback_query(F.data == "partnership")
async def partnership_start(callback: CallbackQuery, bot: Bot):
    """Раздел сотрудничества"""
    await show_typing(bot, callback.message.chat.id)
    
    await callback.message.edit_text(
        "Выберите тип предложения:",
        reply_markup=get_partnership_buttons()
    )
    await callback.answer()


@router.callback_query(F.data.startswith("partner:"))
async def partnership_type(callback: CallbackQuery, bot: Bot):
    """Обработка типа партнерства"""
    ptype = callback.data.split(":")[1]
    
    if ptype == "ads":
        await show_typing(bot, callback.message.chat.id)
        await callback.message.edit_text(
            "Рекламные размещения не рассматриваем.\nМы фокусируемся на разработке ботов для бизнеса.",
            reply_markup=get_back_to_menu()
        )
    elif ptype == "jobs":
        await show_typing(bot, callback.message.chat.id)
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="💼 Перейти к вакансиям", url="https://www.chatbot24.su/career")],
            [InlineKeyboardButton(text="⬅️ В меню", callback_data="main_menu")],
        ])
        await callback.message.edit_text(
            "Актуальные вакансии размещаем на сайте.\nПроверьте раздел «Карьера».",
            reply_markup=kb
        )
    else:
        await show_typing(bot, callback.message.chat.id)
        await callback.message.edit_text(
            "Кратко опишите предложение и оставьте контакт.\nМы рассматриваем предложения в течение 3 рабочих дней.",
            reply_markup=get_back_to_menu()
        )
    
    await callback.answer()
