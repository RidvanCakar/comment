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
    JSON,
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
    analysis_credits = Column(Integer, nullable=False, default=5)
    is_verified = Column(Boolean, nullable=False, default=False, index=True)
    verify_token = Column(String(255), nullable=True, unique=True, index=True)
    verify_token_expires_at = Column(DateTime, nullable=True)
    reset_token = Column(String(255), nullable=True, unique=True, index=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    sessions = relationship(
        "AuthSession", back_populates="user", cascade="all, delete-orphan"
    )
    channel_analyses = relationship(
        "ChannelAnalysis", back_populates="user", cascade="all, delete-orphan"
    )
    feedbacks = relationship(
        "Feedback", back_populates="user", cascade="all, delete-orphan"
    )


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category = Column(String(50), nullable=False, default="general", index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="pending", index=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="feedbacks")


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
    ip_address = Column(String(64), nullable=True, index=True)
    analyses_used = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)


class UserAnalysisCharge(Base):
    """Kullanıcının kredi harcadığı videolar (aynı video tekrarı ücretsiz)."""
    __tablename__ = "user_analysis_charges"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    video_id = Column(String(32), primary_key=True)
    charged_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class ChannelAnalysis(Base):
    """Kanal geneli çoklu video analiz sentez sonuçları."""
    __tablename__ = "channel_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    channel_id = Column(String(64), nullable=False, index=True)
    channel_title = Column(String(255), nullable=False)
    video_count = Column(Integer, nullable=False, default=0)
    analyzed_video_ids = Column(JSON, nullable=False)
    channel_report = Column(JSON, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="channel_analyses")


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


def _migration_5(bind: Engine) -> None:
    """Kullanıcı e-posta doğrulama alanlarını ekler."""
    columns = {column["name"] for column in inspect(bind).get_columns("users")}
    with bind.begin() as connection:
        if "is_verified" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT 0")
            )
        if "verify_token" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN verify_token VARCHAR(255)")
            )
        if "verify_token_expires_at" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN verify_token_expires_at DATETIME")
            )


def _migration_6(bind: Engine) -> None:
    """Misafir cihaz takibine IP adresi kolonunu ekler."""
    columns = {column["name"] for column in inspect(bind).get_columns("guest_devices")}
    if "ip_address" not in columns:
        with bind.begin() as connection:
            connection.execute(
                text("ALTER TABLE guest_devices ADD COLUMN ip_address VARCHAR(64)")
            )


def _migration_7(bind: Engine) -> None:
    """Kanal geneli toplu analiz (ChannelAnalysis) tablosunu ekler."""
    ChannelAnalysis.__table__.create(bind=bind, checkfirst=True)


def _migration_8(bind: Engine) -> None:
    """Kullanıcı şifre sıfırlama (forgot password) alanlarını ekler."""
    columns = {column["name"] for column in inspect(bind).get_columns("users")}
    with bind.begin() as connection:
        if "reset_token" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)")
            )
        if "reset_token_expires_at" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME")
            )


def _migration_9(bind: Engine) -> None:
    """Kullanıcı geri bildirim ve öneri (Feedback) tablosunu ekler."""
    Feedback.__table__.create(bind=bind, checkfirst=True)


MIGRATIONS = (
    (1, "video_analysis_cache_column", _migration_1),
    (2, "users_and_auth_sessions", _migration_2),
    (3, "analysis_credits_and_guest_devices", _migration_3),
    (4, "user_analysis_charges", _migration_4),
    (5, "user_email_verification", _migration_5),
    (6, "guest_device_ip_tracking", _migration_6),
    (7, "channel_analysis_table", _migration_7),
    (8, "user_password_reset", _migration_8),
    (9, "feedback_table", _migration_9),
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


def save_channel_analysis(
    db: Session,
    channel_id: str,
    channel_title: str,
    video_count: int,
    analyzed_video_ids: list,
    channel_report: dict,
    user_id: Optional[int] = None,
) -> ChannelAnalysis:
    """Kanal geneli analiz sonucunu veritabanına kaydeder."""
    record = ChannelAnalysis(
        user_id=user_id,
        channel_id=channel_id,
        channel_title=channel_title,
        video_count=video_count,
        analyzed_video_ids=analyzed_video_ids,
        channel_report=channel_report,
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_latest_channel_analysis(db: Session, channel_id: str) -> Optional[ChannelAnalysis]:
    """Belirtilen kanal için en son kaydedilmiş analizi döndürür."""
    return (
        db.query(ChannelAnalysis)
        .filter(ChannelAnalysis.channel_id == channel_id)
        .order_by(ChannelAnalysis.created_at.desc())
        .first()
    )


def delete_video_analysis(db: Session, video_id: str) -> bool:
    """Belirtilen video analizini ve ilgili ücretlendirme kaydını veritabanından siler."""
    deleted = False
    record = db.query(VideoAnalysis).filter(VideoAnalysis.video_id == video_id).first()
    if record:
        db.delete(record)
        deleted = True

    charges = db.query(UserAnalysisCharge).filter(UserAnalysisCharge.video_id == video_id).all()
    for charge in charges:
        db.delete(charge)
        deleted = True

    if deleted:
        db.commit()
    return deleted


def delete_channel_analysis(db: Session, channel_identifier: str) -> bool:
    """Belirtilen kanal analizini veritabanından siler (channel_id veya record id ile)."""
    deleted = False
    if channel_identifier.isdigit():
        record = db.query(ChannelAnalysis).filter(ChannelAnalysis.id == int(channel_identifier)).first()
        if record:
            db.delete(record)
            deleted = True

    records = db.query(ChannelAnalysis).filter(ChannelAnalysis.channel_id == channel_identifier).all()
    for rec in records:
        db.delete(rec)
        deleted = True

    if deleted:
        db.commit()
    return deleted

