from datetime import datetime
from typing import Annotated, Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from database import Feedback, User, get_db
from auth import get_current_user, require_admin

feedback_router = APIRouter(prefix="/feedback", tags=["Geri Bildirim"])
admin_feedback_router = APIRouter(prefix="/admin/feedbacks", tags=["Admin Geri Bildirim"])

VALID_CATEGORIES = {"feature_request", "bug_report", "improvement", "general"}
VALID_STATUSES = {"pending", "in_review", "planned", "completed", "rejected"}


class CreateFeedbackRequest(BaseModel):
    category: str = Field(default="general", max_length=50)
    title: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=5, max_length=5000)


class UpdateFeedbackRequest(BaseModel):
    status: Optional[str] = Field(default=None, max_length=30)
    admin_notes: Optional[str] = Field(default=None, max_length=5000)


def serialize_feedback(feedback: Feedback, include_user: bool = False):
    data = {
        "id": feedback.id,
        "user_id": feedback.user_id,
        "category": feedback.category,
        "title": feedback.title,
        "message": feedback.message,
        "status": feedback.status,
        "admin_notes": feedback.admin_notes,
        "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
        "updated_at": feedback.updated_at.isoformat() if feedback.updated_at else None,
    }
    if include_user and feedback.user:
        data["user"] = {
            "id": feedback.user.id,
            "email": feedback.user.email,
            "full_name": feedback.user.full_name,
            "role": feedback.user.role,
        }
    return data


# --- KULLANICI ENDPOINT'LERİ ---

@feedback_router.post("", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: CreateFeedbackRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    category = payload.category.strip().lower()
    if category not in VALID_CATEGORIES:
        category = "general"

    title = payload.title.strip()
    message = payload.message.strip()

    feedback = Feedback(
        user_id=current_user.id,
        category=category,
        title=title,
        message=message,
        status="pending",
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "message": "Geri bildiriminiz başarıyla iletildi. Değerli katkınız için teşekkür ederiz!",
        "feedback": serialize_feedback(feedback),
    }


@feedback_router.get("/my")
def get_my_feedbacks(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.user_id == current_user.id)
        .order_by(desc(Feedback.created_at))
        .all()
    )
    return {
        "feedbacks": [serialize_feedback(f) for f in feedbacks]
    }


# --- ADMIN ENDPOINT'LERİ ---

@admin_feedback_router.get("")
def list_admin_feedbacks(
    _admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    query = db.query(Feedback).join(User, Feedback.user_id == User.id)

    if category and category in VALID_CATEGORIES:
        query = query.filter(Feedback.category == category)

    if status_filter and status_filter in VALID_STATUSES:
        query = query.filter(Feedback.status == status_filter)

    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Feedback.title.ilike(search_term),
                Feedback.message.ilike(search_term),
                User.email.ilike(search_term),
                User.full_name.ilike(search_term),
            )
        )

    total_count = query.count()
    feedbacks = (
        query.order_by(desc(Feedback.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "feedbacks": [serialize_feedback(f, include_user=True) for f in feedbacks],
    }


@admin_feedback_router.patch("/{feedback_id}")
def update_admin_feedback(
    feedback_id: int,
    payload: UpdateFeedbackRequest,
    _admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geri bildirim bulunamadı.",
        )

    if payload.status is not None:
        new_status = payload.status.strip().lower()
        if new_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geçersiz durum. Geçerli durumlar: {', '.join(VALID_STATUSES)}",
            )
        feedback.status = new_status

    if payload.admin_notes is not None:
        feedback.admin_notes = payload.admin_notes.strip()

    feedback.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(feedback)

    return {
        "message": "Geri bildirim durumu güncellendi.",
        "feedback": serialize_feedback(feedback, include_user=True),
    }


@admin_feedback_router.delete("/{feedback_id}")
def delete_admin_feedback(
    feedback_id: int,
    _admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geri bildirim bulunamadı.",
        )

    db.delete(feedback)
    db.commit()

    return {"message": "Geri bildirim başarıyla silindi."}
