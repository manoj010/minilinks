from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.link import Link
from app.models.user import User
from app.schemas.link import LinkCreate, LinkRead, LinkReorderRequest, LinkUpdate
from app.services.link_service import (
    create_link,
    get_owned_link,
    list_user_links,
    reorder_links,
    update_link,
)


router = APIRouter(prefix="/links", tags=["Links"])


@router.get("", response_model=list[LinkRead])
def list_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_user_links(db, current_user)


@router.post("", response_model=LinkRead, status_code=201)
def add_link(
    payload: LinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_link(db, current_user, payload)


@router.put("/{link_id}", response_model=LinkRead)
def edit_link(
    link_id: int,
    payload: LinkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_link(db, get_owned_link(db, current_user, link_id), payload)


@router.delete("/{link_id}", status_code=204)
def delete_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    link = get_owned_link(db, current_user, link_id)
    db.delete(link)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/reorder", response_model=list[LinkRead])
def reorder(
    payload: LinkReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return reorder_links(db, current_user, payload)


@router.patch("/{link_id}/toggle", response_model=LinkRead)
def toggle_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = get_owned_link(db, current_user, link_id)
    link.is_active = not link.is_active
    db.commit()
    db.refresh(link)
    return link


@router.post("/{link_id}/click", status_code=204)
def record_click(link_id: int, db: Session = Depends(get_db)):
    link = db.get(Link, link_id)
    if link is None or not link.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Link not found")
    link.click_count += 1
    db.commit()
    return None
