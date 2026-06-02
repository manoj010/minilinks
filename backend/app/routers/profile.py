from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import ProfileUpdate, UserRead
from app.services.auth_service import get_user_by_username


router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/me", response_model=UserRead)
def get_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/me", response_model=UserRead)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    updates = payload.model_dump(exclude_unset=True)
    next_username = updates.get("username")
    if next_username:
        next_username = next_username.lower()
        existing = get_user_by_username(db, next_username)
        if existing and existing.id != current_user.id:
            raise HTTPException(status.HTTP_409_CONFLICT, "Username is already taken")
        updates["username"] = next_username

    for key, value in updates.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user
