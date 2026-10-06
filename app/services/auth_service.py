from functools import wraps
from werkzeug.security import generate_password_hash
from ..model.user import User
from ..db import get_db

class AuthService:
    def __init__(self, db):
        self.db = db

    def login(self, username: str, password: str) -> User | None:
        row = self.db.execute(
            "SELECT * FROM users WHERE username=?", (username,)
        ).fetchone()
        if row is None:
            return None
        user = User.from_row(row)
        if not user.verify_password(password):
            return None
        return user

    def logout(self, session: dict) -> None:
        session.clear()

    def current_user(self) -> User | None:
        uid = session.get('user_id')
        if uid is None:
            return None
        row = self.db.execute(
            "SELECT * FROM users WHERE id=?", (uid,)
        ).fetchone()
        return User.from_row(row) if row else None