from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.link import Link
from app.models.user import User
from app.schemas.link import PublicProfile


router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/{username}", response_model=PublicProfile)
def public_profile(username: str, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == username.lower()))
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    links = list(
        db.scalars(
            select(Link)
            .where(Link.user_id == user.id, Link.is_active.is_(True))
            .order_by(Link.position, Link.created_at)
        )
    )
    return PublicProfile(user=user, links=links)
