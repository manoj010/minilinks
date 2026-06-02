from sqlalchemy import select

from app.database import SessionLocal
from app.models.link import Link
from app.models.user import User
from app.utils.security import hash_password


def main() -> None:
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.email == "demo@example.com"))
        if existing:
            print("Demo user already exists: demo@example.com / password123")
            return
        user = User(
            name="Demo Creator",
            email="demo@example.com",
            username="demo",
            password_hash=hash_password("password123"),
            bio="A sample MiniLinks profile.",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces",
            theme="sunset",
        )
        db.add(user)
        db.flush()
        db.add_all(
            [
                Link(user_id=user.id, title="Portfolio", url="https://example.com", position=0),
                Link(user_id=user.id, title="GitHub", url="https://github.com", position=1),
                Link(user_id=user.id, title="Newsletter", url="https://example.com/newsletter", position=2),
            ]
        )
        db.commit()
        print("Created demo user: demo@example.com / password123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
