import os
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    event,
    func,
    inspect,
    text,
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

# SQLite veritabanı dosyasının database.py ile aynı klasörde olmasını sağlıyoruz
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'video_analysis.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
    """SQLite bağlantılarında foreign key kısıtlarını etkinleştirir."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


class VideoAnalysis(Base):
    __tablename__ = "video_analysis"

    video_id = Column(String, primary_key=True, unique=True)
    video_title = Column(String, nullable=False)
    channel_title = Column(String, nullable=False)
    analysis_json = Column(Text, nullable=False)  # Gemini sonucunu saklayan JSON string
    comment_count_analyzed = Column(Integer, nullable=False)
    raw_comments_json = Column(Text, nullable=True)  # Ham çekilen tüm yorumlar (JSON string)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("provider IN ('email', 'google')", name="ck_users_provider"),
        CheckConstraint("role IN ('admin', 'user')", name="ck_users_role"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(320), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=True)
    provider = Column(String(20), nullable=False, default="email", index=True)
    provider_id = Column(String(255), nullable=True, unique=True)
    avatar_url = Column(String(2048), nullable=True)
    role = Column(String(20), nullable=False, default="user", index=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    last_login_at = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime, nullable=True)
    analysis_credits = Column(Integer, nullable=False, default=3)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    sessions = relationship(
        "AuthSession", back_populates="user", cascade="all, delete-orphan"
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_seen_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)

    user = relationship("User", back_populates="sessions")


class GuestDevice(Base):
    __tablename__ = "guest_devices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    analyses_used = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)


class UserAnalysisCharge(Base):
    """Kullanıcının kredi harcadığı videolar (aynı video tekrarı ücretsiz)."""
    __tablename__ = "user_analysis_charges"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    video_id = Column(String(32), primary_key=True)
    charged_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class SchemaMigration(Base):
    __tablename__ = "schema_migrations"

    version = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    applied_at = Column(DateTime, nullable=False, default=datetime.utcnow)


def _migration_1(bind: Engine) -> None:
    """Mevcut analiz tablosuna eksik cache kolonunu veri kaybetmeden ekler."""
    VideoAnalysis.__table__.create(bind=bind, checkfirst=True)
    columns = {column["name"] for column in inspect(bind).get_columns("video_analysis")}
    if "raw_comments_json" not in columns:
        with bind.begin() as connection:
            connection.execute(
                text("ALTER TABLE video_analysis ADD COLUMN raw_comments_json TEXT")
            )


def _migration_2(bind: Engine) -> None:
    """Kullanıcı ve oturum tablolarını ekler."""
    User.__table__.create(bind=bind, checkfirst=True)
    AuthSession.__table__.create(bind=bind, checkfirst=True)


def _migration_3(bind: Engine) -> None:
    """Analiz kredisi ve misafir cihaz takibini ekler."""
    GuestDevice.__table__.create(bind=bind, checkfirst=True)
    columns = {column["name"] for column in inspect(bind).get_columns("users")}
    if "analysis_credits" not in columns:
        with bind.begin() as connection:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN analysis_credits INTEGER NOT NULL DEFAULT 3")
            )
    with bind.begin() as connection:
        connection.execute(text("UPDATE users SET analysis_credits = 3 WHERE analysis_credits IS NULL"))


def _migration_4(bind: Engine) -> None:
    """Kullanıcı başına video bazlı kredi takibini ekler."""
    UserAnalysisCharge.__table__.create(bind=bind, checkfirst=True)


MIGRATIONS = (
    (1, "video_analysis_cache_column", _migration_1),
    (2, "users_and_auth_sessions", _migration_2),
    (3, "analysis_credits_and_guest_devices", _migration_3),
    (4, "user_analysis_charges", _migration_4),
)


def init_db(bind: Optional[Engine] = None) -> None:
    """Sürüm kontrollü, yalnızca eklemeli şema geçişlerini uygular."""
    target = bind or engine
    SchemaMigration.__table__.create(bind=target, checkfirst=True)

    with Session(target) as session:
        applied = {
            row[0] for row in session.query(SchemaMigration.version).all()
        }

    for version, name, migration in MIGRATIONS:
        if version in applied:
            continue
        migration(target)
        with Session(target) as session:
            session.add(SchemaMigration(version=version, name=name))
            session.commit()

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
