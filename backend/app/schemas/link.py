from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.schemas.user import UserRead


class LinkBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    url: HttpUrl
    description: str | None = ""
    icon: str | None = ""
    position: int | None = 0
    is_active: bool = True


class LinkCreate(LinkBase):
    pass


class LinkUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    url: HttpUrl | None = None
    description: str | None = None
    icon: str | None = None
    position: int | None = None
    is_active: bool | None = None


class LinkRead(LinkBase):
    id: int
    user_id: int
    click_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LinkReorderItem(BaseModel):
    id: int
    position: int


class LinkReorderRequest(BaseModel):
    links: list[LinkReorderItem]


class PublicProfile(BaseModel):
    user: UserRead
    links: list[LinkRead]
