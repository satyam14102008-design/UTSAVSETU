import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.models.user import UserRegister, UserLogin, UserResponse, TokenResponse
from backend.app.auth import hash_password, verify_password, create_access_token, get_current_user
from backend.app.database import get_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister):
    users_col = get_collection("users")
    existing = users_col.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email.lower(),
        "hashed_password": hash_password(user_data.password),
        "phone": user_data.phone,
        "family_name": user_data.family_name,
        "created_at": datetime.utcnow().isoformat()
    }
    users_col.insert_one(new_user)
    
    token = create_access_token({"sub": user_id, "email": new_user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=new_user["name"],
            email=new_user["email"],
            phone=new_user["phone"],
            family_name=new_user["family_name"],
            created_at=new_user["created_at"]
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin):
    users_col = get_collection("users")
    user = users_col.find_one({"email": login_data.email.lower()})
    if not user or not verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            phone=user.get("phone"),
            family_name=user.get("family_name"),
            created_at=user.get("created_at")
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        phone=current_user.get("phone"),
        family_name=current_user.get("family_name"),
        created_at=current_user.get("created_at")
    )

