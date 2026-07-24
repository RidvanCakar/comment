# YorumAI - YouTube Yorum Analiz Platformu (Local & Yapay Zeka Destekli)

Bu proje, içerik üreticilerinin kendi YouTube videolarına gelen yorumları local ortamda, tamamen ücretsiz API limitleri kullanarak yapay zeka ile analiz etmesini sağlayan bir web uygulamasıdır.

Sistem, video yorumlarını çeker, anlamsız/spam/emoji içerenleri ayıklar ve **Gemini 2.5 Flash** kullanarak videonun duygu dağılımı (olumlu, olumsuz, nötr), yorum hacmine göre dinamik sayıda ana konu (yaklaşık 3–8) ve içerik üreticisine yönelik aksiyon alınabilir tavsiyeler üreten bir rapor sunar.

---

## 🚀 Teknolojik Mimari

- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic, python-dotenv
- **Yapay Zeka (LLM):** Google Gemini API (`google-generativeai`, model: `gemini-2.5-flash`)
- **Veri Çekme:** YouTube Data API v3 (`google-api-python-client`)
- **Veritabanı / Önbellek (Cache):** SQLite (SQLAlchemy ORM ile) — Aynı video tekrar analiz edildiğinde API kotalarının tükenmemesi için yerel cache mekanizması mevcuttur.
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Stil:** Tailwind CSS v4 (`app/globals.css` üzerinden)
- **Durum Yönetimi:** React `useState` (ek bir global state kütüphanesi yok)

---

## 📂 Klasör Yapısı

```
comment/
├── backend/
│   ├── main.py              # FastAPI uygulaması ve API uç noktaları
│   ├── youtube_service.py   # YouTube Video ID extraction ve API veri çekme mantığı
│   ├── gemini_service.py    # Gemini API entegrasyonu ve yapılandırılmış JSON çıktısı
│   ├── database.py          # SQLite DB bağlantısı, cache tablosu ve CRUD fonksiyonları
│   ├── requirements.txt     # Python bağımlılık paketleri
│   ├── .env                 # API anahtarları (gizli, git'e eklenmez)
│   ├── .env.example         # Örnek env dosyası
│   └── .gitignore           # Git yoksayma dosyası
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout, fontlar ve metadata
│   │   ├── page.tsx         # Ana sayfa (analiz akışı ve sonuç panelleri)
│   │   └── globals.css      # Tailwind v4 tema değişkenleri ve özel animasyonlar
│   ├── components/
│   │   ├── AnalyzeForm.tsx  # URL girişi ve "Yeniden Analiz Et" seçeneği
│   │   ├── SentimentBar.tsx # Duygu dağılımı görseli
│   │   ├── TopicMeter.tsx   # Konu başlıkları / örnek yorumlar
│   │   ├── LoadingState.tsx # Yüklenme durumu
│   │   └── ErrorState.tsx   # Hata durumu
│   ├── package.json         # Next.js bağımlılıkları ve scriptler
│   ├── next.config.ts       # Next.js yapılandırması
│   ├── postcss.config.mjs   # PostCSS / Tailwind yapılandırması
│   ├── tsconfig.json        # TypeScript yapılandırması
│   └── .env.local           # NEXT_PUBLIC_API_URL (backend adresi)
└── README.md                # Kurulum ve kullanım yönergeleri
```

> Not: `backend/venv/`, `backend/video_analysis.db` ve `frontend/node_modules/` çalışma zamanında oluşur; kaynak kod yapısının parçası değildir.

---

## ⚙️ Kurulum ve Çalıştırma Adımları

### 1. Python Sanal Ortam Kurulumu
Backend dizinine girip sanal ortam oluşturun ve aktif hale getirin:

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Backend Bağımlılıklarının Kurulması
```bash
pip install -r requirements.txt
```

### 3. API Anahtarlarının Girilmesi
`backend/` klasörünün içinde bir `.env` dosyası oluşturun (veya `.env.example` dosyasını kopyalayın) ve anahtarları ekleyin:
```env
YOUTUBE_API_KEY=KENDI_YOUTUBE_API_ANAHTARINIZ
GEMINI_API_KEY=KENDI_GEMINI_API_ANAHTARINIZ
```

### 4. API Sunucusunun Başlatılması
FastAPI backend'ini çalıştırmak için:
```bash
python main.py
```
Sunucu varsayılan olarak **`http://127.0.0.1:8000`** adresinde çalışır. Tarayıcıda bu adresi açtığınızda `{"status": "ok", ...}` çıktısını görerek doğrulayabilirsiniz.

### 5. Frontend Kurulumu ve Çalıştırma
Ayrı bir terminalde `frontend/` dizinine geçin:
```bash
cd frontend
npm install
npm run dev
```
Next.js geliştirme sunucusu varsayılan olarak **`http://localhost:3000`** adresinde açılır.

Frontend, backend'e `NEXT_PUBLIC_API_URL` üzerinden bağlanır (`frontend/.env.local` içinde varsayılan: `http://localhost:8000`).

| Script | Komut | Açıklama |
|--------|--------|----------|
| Geliştirme | `npm run dev` | `next dev` — yerel geliştirme sunucusu |
| Production build | `npm run build` | `next build` |
| Production start | `npm start` | `next start` |
| Lint | `npm run lint` | ESLint |

---

## 💡 Kota ve Önbellek (Cache) Çalışma Mantığı

1. **Önbellek Korunması:** Bir YouTube videosu analiz edildiğinde, elde edilen analiz sonucu SQLite veritabanına (`video_analysis.db`) kaydedilir. Aynı video için tekrar analiz istendiğinde, backend API anahtarı sınırlarını ve kotaları zorlamamak adına doğrudan yerel veritabanındaki veriyi getirir. Arayüzde de **ÖNBELLEK** rozeti gösterilir.
2. **Yeniden Analiz (Force Refresh):** Videoya yeni yorumlar gelmişse veya analizi yenilemek isterseniz, arayüzdeki **YENİDEN ANALİZ ET (ÖNBELLEĞİ ATLA)** seçeneğini aktif ederek önbelleği atlayıp taze verilerle yeni bir istek gerçekleştirebilirsiniz.
3. **Yorum Limiti:** Ücretsiz YouTube kota limiti ve Gemini istek limitlerini aşmamak adına varsayılan analiz edilecek yorum sayısı `MAX_COMMENTS = 1500` olarak sınırlandırılmıştır. Bu limiti `backend/main.py` dosyasındaki `MAX_COMMENTS` sabitinden değiştirebilirsiniz.
