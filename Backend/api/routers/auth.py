from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
import secrets
from core.database import get_db
from models.auth import User, PasswordResetToken
from models.audit import AuditLog
from core.security import verify_password, get_password_hash, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

def log_audit(db: Session, user_id: int | None, action: str, entity_type: str, details: str = None):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        details=details
    )
    db.add(log)
    db.commit()

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        log_audit(db, None, "LOGIN_FAILED", "User", f"email: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(request.password, user.hashed_password):
        log_audit(db, user.id, "LOGIN_FAILED", "User", f"email: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    log_audit(db, user.id, "LOGIN", "User")
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit(db, current_user.id, "LOGOUT", "User")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        # Generate token
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # In MVP, delete existing tokens for this user
        db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).delete()
        
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at.replace(tzinfo=None) # Sqlite naive datetime
        )
        db.add(reset_token)
        log_audit(db, user.id, "PASSWORD_RESET_REQUESTED", "User")
        db.commit()
        
        # In a real app we'd email this token. For demo, we just print or assume the user gets it.
        # Returning token in response ONLY for MVP testing. In prod this is a huge security vulnerability.
        return {"message": "If the email exists, a reset link has been sent.", "mvp_dev_token": token}
    
    return {"message": "If the email exists, a reset link has been sent."}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_record = db.query(PasswordResetToken).filter(PasswordResetToken.token == request.token).first()
    
    if not token_record or token_record.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
        
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token.")
        
    user.hashed_password = get_password_hash(request.new_password)
    db.delete(token_record)
    log_audit(db, user.id, "PASSWORD_RESET", "User")
    db.commit()
    
    return {"message": "Password has been reset successfully."}
