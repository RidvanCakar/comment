from sqlalchemy import create_engine, inspect, text

from database import init_db


def test_migration_preserves_existing_video_analysis(tmp_path):
    db_path = tmp_path / "legacy.db"
    test_engine = create_engine(f"sqlite:///{db_path}")
    with test_engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE video_analysis (
                    video_id VARCHAR PRIMARY KEY,
                    video_title VARCHAR NOT NULL,
                    channel_title VARCHAR NOT NULL,
                    analysis_json TEXT NOT NULL,
                    comment_count_analyzed INTEGER NOT NULL,
                    created_at DATETIME
                )
                """
            )
        )
        connection.execute(
            text(
                """
                INSERT INTO video_analysis
                    (video_id, video_title, channel_title, analysis_json,
                     comment_count_analyzed, created_at)
                VALUES ('abc123', 'Başlık', 'Kanal', '{}', 42, CURRENT_TIMESTAMP)
                """
            )
        )

    init_db(test_engine)
    init_db(test_engine)

    columns = {
        column["name"] for column in inspect(test_engine).get_columns("video_analysis")
    }
    assert "raw_comments_json" in columns
    with test_engine.connect() as connection:
        row = connection.execute(
            text(
                "SELECT video_title, comment_count_analyzed "
                "FROM video_analysis WHERE video_id='abc123'"
            )
        ).one()
        versions = connection.execute(
            text("SELECT COUNT(*) FROM schema_migrations")
        ).scalar_one()
    assert row == ("Başlık", 42)
    assert versions == 4
