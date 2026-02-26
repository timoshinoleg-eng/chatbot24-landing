-- ChatBot24 Studio - Supabase Schema
-- Таблица leads для хранения лидов без имени и телефона!

CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lead_task VARCHAR(50),
    lead_scale VARCHAR(20),
    lead_timeline VARCHAR(20),
    lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
    source VARCHAR(50) DEFAULT 'telegram_bot',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    tags VARCHAR(20) CHECK (tags IN ('Lead_Hot', 'Lead_Warm', 'Lead_Cold')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON leads(tags);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Комментарии к полям
COMMENT ON TABLE leads IS 'Таблица лидов (без имени и телефона!)';
COMMENT ON COLUMN leads.user_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN leads.lead_task IS 'Задача: sales, support, booking, crm, other';
COMMENT ON COLUMN leads.lead_scale IS 'Масштаб: 100, 500, 500plus';
COMMENT ON COLUMN leads.lead_timeline IS 'Срок: 30, 90, research';
COMMENT ON COLUMN leads.lead_score IS 'Скоринг 0-100';
COMMENT ON COLUMN leads.tags IS 'Тег: Lead_Hot, Lead_Warm, Lead_Cold';
COMMENT ON COLUMN leads.status IS 'Статус: new, contacted, converted';

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - базовые политики
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (только для авторизованных)
CREATE POLICY IF NOT EXISTS "Allow select for authenticated" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

-- Политика для вставки (через API ключ)
CREATE POLICY IF NOT EXISTS "Allow insert with API key" ON leads
    FOR INSERT WITH CHECK (true);
