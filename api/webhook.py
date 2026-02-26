"""
ChatBot24 Studio - Supabase Integration
Vercel Serverless Function for saving leads
"""
import json
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler
import urllib.request


# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_ADMIN_ID = os.environ.get("TELEGRAM_ADMIN_ID", "")


def calculate_lead_score(data: dict) -> int:
    """Calculate lead score (0-100)"""
    score = 0
    
    # By timeline
    timeline = data.get("lead_timeline", "")
    if timeline == "30":  # До 30 дней
        score += 40
    elif timeline == "90":  # 1–3 месяца
        score += 20
    elif timeline == "research":  # Изучаю рынок
        score += 5
    
    # By scale
    scale = data.get("lead_scale", "")
    if scale == "500plus":
        score += 20
    elif scale == "500":
        score += 10
    
    # Additional factors
    if data.get("contact_received"):
        score += 20
    if data.get("demo_completed"):
        score += 15
    if data.get("brief_sent"):
        score += 30
    
    return min(score, 100)


def get_lead_tag(score: int) -> str:
    """Get lead tag based on score"""
    if score >= 80:
        return "Lead_Hot"
    elif score >= 50:
        return "Lead_Warm"
    else:
        return "Lead_Cold"


def save_to_supabase(lead_data: dict) -> dict:
    """Save lead to Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {"error": "Supabase not configured"}
    
    url = f"{SUPABASE_URL}/rest/v1/leads"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(lead_data).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = response.read().decode('utf-8')
            return {"success": True, "data": json.loads(result)}
    except Exception as e:
        return {"error": str(e)}


def send_telegram_notification(user_id: str, phone: str, lead_data: dict) -> dict:
    """Send notification to manager about Hot Lead"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_ADMIN_ID:
        return {"error": "Telegram not configured"}
    
    tag = lead_data.get("tags", "Lead_Cold")
    
    # Only notify for Hot leads
    if tag != "Lead_Hot":
        return {"skipped": "Not a Hot lead"}
    
    # Map timeline codes to readable text
    timeline_map = {
        "30": "До 30 дней",
        "90": "1–3 месяца",
        "research": "Изучаю рынок"
    }
    
    # Map scale codes to readable text
    scale_map = {
        "100": "до 100",
        "500": "100–500",
        "500plus": "500+"
    }
    
    # Map task codes to readable text
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
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_ADMIN_ID,
            "text": message,
            "parse_mode": "HTML"
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = response.read().decode('utf-8')
            return {"success": True, "data": json.loads(result)}
    except Exception as e:
        return {"error": str(e)}


class handler(BaseHTTPRequestHandler):
    """Vercel serverless handler"""
    
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "ok",
            "message": "Supabase integration endpoint is active"
        }).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read body
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            # Calculate lead score
            score = calculate_lead_score(data)
            tag = get_lead_tag(score)
            
            # Prepare data for Supabase (NO name and phone!)
            supabase_data = {
                "user_id": str(data.get("user_id", "")),
                "lead_task": data.get("lead_task", ""),
                "lead_scale": data.get("lead_scale", ""),
                "lead_timeline": data.get("lead_timeline", ""),
                "lead_score": score,
                "source": data.get("source", "telegram_bot"),
                "utm_source": data.get("utm_source", ""),
                "utm_medium": data.get("utm_medium", ""),
                "tags": tag,
                "status": "new",
                "created_at": datetime.now().isoformat()
            }
            
            # Save to Supabase
            supabase_result = save_to_supabase(supabase_data)
            
            # Send notification for Hot leads (include phone here!)
            notification_result = None
            if tag == "Lead_Hot":
                notification_result = send_telegram_notification(
                    user_id=str(data.get("user_id", "")),
                    phone=data.get("phone", "Не указан"),
                    lead_data=supabase_data
                )
            
            # Response
            response_data = {
                "success": True,
                "lead_score": score,
                "lead_tag": tag,
                "supabase": supabase_result,
                "notification": notification_result
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except json.JSONDecodeError as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Invalid JSON",
                "details": str(e)
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Internal server error",
                "details": str(e)
            }).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
