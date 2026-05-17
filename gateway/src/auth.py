"""Local JWT authentication for the Hive gateway."""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

# Fix passlib + bcrypt compatibility
import bcrypt
bcrypt.__about__ = type("about", (), {"__version__": bcrypt.__version__})()

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("GATEWAY_SECRET", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# In MVP, hardcoded users. Replace with DB later.
USERS = {
    "admin": {
        "username": "admin",
        "hashed_password": "",  # set on first run
        "role": "admin",
    }
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def _init_default_password():
    """Set default admin password if not set."""
    if not USERS["admin"]["hashed_password"]:
        default_pw = os.getenv("ADMIN_PASSWORD", "hive-admin")
        USERS["admin"]["hashed_password"] = pwd_context.hash(default_pw)


_init_default_password()


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = USERS.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in USERS:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return USERS[username]
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def verify_ws_token(token: str | None) -> dict | None:
    """Verify a JWT token for WebSocket connections. Returns user dict or None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username and username in USERS:
            return USERS[username]
    except JWTError:
        pass
    return None
