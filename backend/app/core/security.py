"""Password hashing for legacy/seeded demo accounts (Clerk-managed users don't use this)."""
import bcrypt


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
