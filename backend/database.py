import os
from typing import Optional
from sqlalchemy import create_engine, Column, String, Integer, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# SQLite veritabanı dosyasının database.py ile aynı klasörde olmasını sağlıyoruz
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'video_analysis.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class VideoAnalysis(Base):
    __tablename__ = "video_analysis"

    video_id = Column(String, primary_key=True, unique=True)
    video_title = Column(String, nullable=False)
    channel_title = Column(String, nullable=False)
    analysis_json = Column(Text, nullable=False)  # Gemini sonucunu saklayan JSON string
    comment_count_analyzed = Column(Integer, nullable=False)
    raw_comments_json = Column(Text, nullable=True)  # Ham çekilen tüm yorumlar (JSON string)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

def init_db() -> None:
    """Veritabanı tablolarını oluşturur. Kolon uyuşmazlığı varsa tabloyu sıfırlar."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT raw_comments_json FROM video_analysis LIMIT 1"))
    except Exception:
        # Kolon yoksa veya tablo eski ise veritabanını sıfırlıyoruz
        try:
            Base.metadata.drop_all(bind=engine)
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)

def get_db():
    """FastAPI dependency injection için DB session üretici."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_cached_analysis(db: Session, video_id: str) -> Optional[VideoAnalysis]:
    """Önbelleğe alınmış analiz sonucunu getirir."""
    return db.query(VideoAnalysis).filter(VideoAnalysis.video_id == video_id).first()

def save_analysis(
    db: Session,
    video_id: str,
    video_title: str,
    channel_title: str,
    analysis_json: str,
    comment_count_analyzed: int,
    raw_comments_json: str
) -> VideoAnalysis:
    """Analiz sonucunu veritabanına kaydeder veya günceller (Upsert)."""
    from sqlalchemy.dialects.sqlite import insert

    # SQLite için spesifik INSERT OR REPLACE (UPSERT) işlemi
    stmt = insert(VideoAnalysis).values(
        video_id=video_id,
        video_title=video_title,
        channel_title=channel_title,
        analysis_json=analysis_json,
        comment_count_analyzed=comment_count_analyzed,
        raw_comments_json=raw_comments_json
    )
    
    # Eşleşen video_id bulunduğunda satırı güncelle
    do_update_stmt = stmt.on_conflict_do_update(
        index_elements=['video_id'],
        set_=dict(
            video_title=stmt.excluded.video_title,
            channel_title=stmt.excluded.channel_title,
            analysis_json=stmt.excluded.analysis_json,
            comment_count_analyzed=stmt.excluded.comment_count_analyzed,
            raw_comments_json=stmt.excluded.raw_comments_json,
            created_at=func.now()
        )
    )
    
    db.execute(do_update_stmt)
    db.commit()
    
    # Kaydedilen güncel veriyi geri dön
    return db.query(VideoAnalysis).filter(VideoAnalysis.video_id == video_id).first()
