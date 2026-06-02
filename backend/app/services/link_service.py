from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.link import Link
from app.models.user import User
from app.schemas.link import LinkCreate, LinkReorderRequest, LinkUpdate


def list_user_links(db: Session, user: User) -> list[Link]:
    return list(
        db.scalars(
            select(Link).where(Link.user_id == user.id).order_by(Link.position, Link.created_at)
        )
    )


def create_link(db: Session, user: User, payload: LinkCreate) -> Link:
    position = payload.position
    if position is None:
        position = db.scalar(select(func.count(Link.id)).where(Link.user_id == user.id)) or 0
    data = payload.model_dump(exclude={"position"})
    data["url"] = str(data["url"])
    link = Link(user_id=user.id, **data, position=position)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def get_owned_link(db: Session, user: User, link_id: int) -> Link:
    link = db.get(Link, link_id)
    if link is None or link.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Link not found")
    return link


def update_link(db: Session, link: Link, payload: LinkUpdate) -> Link:
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "url" and value is not None:
            value = str(value)
        setattr(link, key, value)
    db.commit()
    db.refresh(link)
    return link


def reorder_links(db: Session, user: User, payload: LinkReorderRequest) -> list[Link]:
    owned = {link.id: link for link in list_user_links(db, user)}
    for item in payload.links:
        if item.id not in owned:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"Link {item.id} not found")
        owned[item.id].position = item.position
    db.commit()
    return list_user_links(db, user)
