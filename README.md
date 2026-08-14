# 🎬 YorumAI - YouTube Video & Kanal Yorum Analiz Platformu

**YorumAI**, içerik üreticilerinin ve dijital pazarlamacıların YouTube video ve kanallarına gelen binlerce yorumu yapay zeka ile derinlemesine analiz etmesini sağlayan modern, full-stack bir analiz platformudur.

Platform; tekil video analizlerinin yanı sıra **Kanal Geneli Toplu Analiz (Channel Insights)**, **Kredi Sistemi**, **E-posta Doğrulama**, **Şifre Sıfırlama**, **Kullanıcı Fikir/Geri Bildirim Yönetimi** ve **Admin Kontrol Paneli** özelliklerini içerir.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🎥 Tekil Video Analizi (1 Kredi)
- YouTube video URL'sinden otomatik yorum çekme (1500+ yoruma kadar).
- **Akıllı Yorum Ön İşleme:** Anlamsız, tek kelimelik veya sadece emoji içeren spam yorumları filtreleme; zaman damgası (`02:15`), soru ve eleştiri içeren zengin yorumları önceliklendirme.
- **Gemini 2.5 Flash ile Derin Analiz:**
  - Genel duygu dağılımı (Olumlu %, Olumsuz %, Nötr %).
  - Yorum hacmine göre dinamik alt kategori ayrıştırması (3–10 tema).
  - Türkçe **ironi, sarkazm ve sitemlerin** doğru duygu kategorisine (`negative`) ayrılması.
  - Somut zaman damgaları ve olaylara dayalı **Nokta Atışı Tavsiye** (Insight, Action, Expected Impact).
- PDF rapor indirme ve etkileşim anları (Highlight Moments) zaman çizelgesi.

### 2. 📊 Kanal Geneli Analiz & Çapraz Sentez (3 Kredi)
- Kanal URL'si, `@kullanıcıadı` veya Kanal ID'si ile son 5 videoyu otomatik tespit etme.
- Videoların analiz sonuçlarını birleştirerek Gemini ile kanal geneli çapraz sentez:
  - **Kanal Sağlık Skoru (0–100)**.
  - **Duygu Trendi:** `IMPROVING` (Gelişiyor), `STABLE` (Dengeli), `DECLINING` (Düşüşte).
  - **Tekrar Eden / Kronik Sorunlar:** Birden fazla videoda süregelen ses, kurgu veya içerik şikayetleri.
  - **Kitle Dinamikleri & Değişim İçgörüleri:** Format ve konu değişikliklerine izleyici reaksiyonları.
  - **Kanal Büyüme Stratejisi:** Tek ve yüksek etkili stratejik eylem planı.

### 3. 💳 Kredi Sistemi & Kayıt Bonusu
- Yeni kayıt olan her kullanıcıya **5 Ücretsiz Kredi** tanımlanır.
- Video Analizi: **1 Kredi**, Kanal Analizi: **3 Kredi**.
- Misafir kullanıcılar için 1 deneme kredisi.
- Admin hesapları için sınırsız analiz yetkisi.

### 4. 💡 Kullanıcı Fikir & Geri Bildirim Sistemi (Admin Yönetimli)
- Kullanıcıların platform içerisinden doğrudan fikir, özellik isteği, iyileştirme veya hata bildirimi gönderebilmesi (`/fikirler`).
- Kullanıcının kendi gönderdiği bildirimlerin durumunu (*Beklemede*, *İnceleniyor*, *Planlandı*, *Tamamlandı*) anlık takip edebilmesi.
- **Admin Geri Bildirim Paneli (`/admin/feedback`):**
  - İstatistik sayaçları, durum sekmeleri ve metin araması.
  - Tek tıkla durum güncelleme ve dahili yönetici notu (`admin_notes`) ekleme.

### 5. 🔐 Güvenli Kimlik Doğrulama & E-posta
- Argon2 parola hashleme, hashlenmiş opaque oturum tokenları.
- **E-posta Doğrulama:** Resend API ile 6 haneli doğrulama kodu.
- **Şifre Sıfırlama:** E-posta ile güvenli tek kullanımlık tokenlı şifre yenileme bağlantısı (`/forgot-password`, `/reset-password`).
- **Admin Kullanıcı Yönetimi (`/admin/users`):** Rol değiştirme, kredi ekleme/çıkarma, kullanıcı kilitleme/silme.

### 6. ⚡ Hata & Kota Yönetimi (429 Rate Limit Koruması)
- Gemini API kotaları aşıldığında otomatik üstel geri çekilme (exponential backoff) ve çoklu model fallback mekanizması (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`).
- SQLite yerel önbellekleme (Cache) sayesinde daha önce analiz edilmiş videolar kotaları tüketmeden anında yüklenir.

---

## 🚀 Teknolojik Mimari

| Katman | Teknoloji / Kütüphane |
|---|---|
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| **Yapay Zeka (LLM)** | Google Gemini API (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) |
| **Veri Çekme** | YouTube Data API v3 (`google-api-python-client`) |
| **E-posta Servisi** | Resend API (`resend`) |
| **Veritabanı** | SQLite (9 aşamalı otomatik migration altyapısı) |
| **Authentication** | Argon2 password hashing, secure SHA-256 session tokens |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Stil & Tema** | Tailwind CSS v4, Açık/Koyu Tema (Dark Mode) desteği |

---

## 📂 Klasör Yapısı

```
comment/
├── backend/
│   ├── main.py                  # FastAPI ana sunucu ve router tanımları
│   ├── auth.py                  # Giriş, kayıt, şifre sıfırlama, oturum yönetimi
│   ├── credits.py               # Kredi kontrolü ve bakiye düşüş mantığı
│   ├── feedback.py              # Kullanıcı ve admin geri bildirim API uçları
│   ├── email_service.py         # Resend e-posta gönderim şablonları
│   ├── youtube_service.py       # YouTube Data API video ve kanal veri çekme
│   ├── gemini_service.py        # Gemini entegrasyonu, promptlar, akıllı yorum filtreleme
│   ├── comment_insights.py      # Öne çıkan yorumlar ve zaman damgası analizi
│   ├── database.py              # SQLAlchemy modelleri ve veritabanı migration'ları (1..9)
│   ├── requirements.txt         # Python bağımlılıkları
│   ├── requirements-dev.txt     # Test bağımlılıkları
│   └── tests/                   # 37 adet kapsamlı pytest birim ve entegrasyon testi
│
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/         # Sol kenar çubuklu (Sidebar) dashboard rotaları
│   │   │   ├── dashboard/       # Genel bakış ve analiz geçmişi
│   │   │   ├── analyze/         # Tekil video analizi
│   │   │   ├── kanal-analizi/   # Kanal geneli analiz ve sentez
│   │   │   ├── analizlerim/     # Kayıtlı video ve kanal analizleri
│   │   │   ├── fikirler/        # Fikir & öneri paylaşım sayfası
│   │   │   ├── destek/          # Destek ve yardım merkezi
│   │   │   ├── sss/             # Sıkça sorulan sorular
│   │   │   ├── ayarlar/         # Kullanıcı hesap ve şifre ayarları
│   │   │   └── admin/           # Admin panelleri (/admin/users, /admin/feedback)
│   │   ├── forgot-password/     # Şifremi unuttum sayfası
│   │   ├── reset-password/      # Şifre sıfırlama sayfası
│   │   ├── verify-email/        # E-posta doğrulama sayfası
│   │   ├── login/ & register/   # Giriş ve kayıt sayfaları
│   │   └── page.tsx             # Modern ürün tanıtım sayfası
│   ├── components/              # Yeniden kullanılabilir React bileşenleri
│   │   ├── auth/                # Auth provider ve giriş formları
│   │   ├── dashboard/           # Sidebar, navbar, analiz kartları
│   │   ├── feedback/            # FeedbackModal bileşeni
│   │   └── pdf/                 # PDF rapor dışa aktarma
│   ├── lib/                     # Typed API istemcisi ve yardımcı fonksiyonlar
│   └── proxy.ts                 # Route koruma proxy'si
└── README.md
```

---

## ⚙️ Kurulum ve Çalıştırma

### 1. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluşturma ve aktifleştirme (Windows)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Bağımlılıkları yükleme
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 2. Ortam Değişkenleri (`backend/.env`)

`backend/` dizininde bir `.env` dosyası oluşturun:

```env
# Google & YouTube API Anahtarları
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Güvenlik & Oturum
AUTH_SECRET=EN_AZ_32_KARAKTERLI_GUVENLI_RASTGELE_ANAHTAR
FRONTEND_URL=http://localhost:3000
FRONTEND_ORIGINS=http://localhost:3000
AUTH_COOKIE_SECURE=false

# İlk Yönetici Hesabı (Kayıt olunduğunda otomatik Admin yapılır)
INITIAL_ADMIN_EMAIL=admin@yorumai.com

# E-posta Servisi (Resend)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY
EMAIL_FROM="YorumAI <onboarding@resend.dev>"
```

### 3. Backend Sunucusunu Başlatma

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
API sunucusu **`http://127.0.0.1:8000`** adresinde çalışır.

### 4. Backend Testlerini Çalıştırma

```bash
cd backend
python -m pytest
```

### 5. Frontend Kurulumu ve Başlatma

Ayrı bir terminalde:

```bash
cd frontend

# Bağımlılıkları yükleme
npm install

# Geliştirme sunucusunu başlatma
npm run dev
```

Uygulama **`http://localhost:3000`** adresinde yayına başlar.

---

## 🧪 Test Kapsamı

Backend test suitinde **37 birim ve entegrasyon testi** bulunmaktadır:
- `test_auth.py`: Kayıt, giriş, oturum doğrulama, rol yetkilendirme.
- `test_channel_insights.py`: Kanal ID çözümleme, son 5 video çekimi, sentez raporlama.
- `test_comment_insights.py`: Yorum puanlama, zaman damgası tespiti, çöp/spam filtreleme.
- `test_credits.py`: 5 kayıt kredisi, video analizi (1 kredi) ve kanal analizi (3 kredi) düşüşleri.
- `test_email_verification.py`: 6 haneli doğrulama kodu üretimi ve doğrulama akışı.
- `test_feedback.py`: Kullanıcı geri bildirim oluşturma, admin filtreleme, durum güncelleme ve silme.
- `test_migrations.py`: 9 aşamalı SQLite veritabanı şema doğrulama testi.
- `test_password_reset.py`: Tokenlı şifre sıfırlama talebi ve yeni şifre belirleme akışı.

---

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
