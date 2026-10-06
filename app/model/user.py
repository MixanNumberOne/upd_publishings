from dataclasses import dataclass
from werkzeug.security import check_password_hash

@dataclass
class User:
    id: int
    username: str
    password_hash: str
    role: str
    created_at: str

    def verify_password(self, plain: str) -> bool:
        return check_password_hash(self.password_hash, plain)

    def is_admin(self) -> bool:
        return self.role == 'admin'

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "created_at": self.created_at,
        }   # password_hash НЕ отдаём

    @classmethod
    def from_row(cls, row) -> "User":
        return cls(**{k: row[k] for k in row.keys()})