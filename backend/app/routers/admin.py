from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_admin_code(db: Session) -> str:
    setting = db.query(models.Setting).filter(models.Setting.key == "admin_code").first()
    return setting.value if setting else "8888"

@router.post("/verify")
def verify_admin(data: schemas.AdminVerify, db: Session = Depends(get_db)):
    if data.code != get_admin_code(db):
        raise HTTPException(401, "Invalid admin code")
    return {"ok": True}

@router.patch("/code")
def change_admin_code(data: schemas.AdminCodeChange, db: Session = Depends(get_db)):
    if data.old_code != get_admin_code(db):
        raise HTTPException(401, "Invalid admin code")
    setting = db.query(models.Setting).filter(models.Setting.key == "admin_code").first()
    if setting:
        setting.value = data.new_code
    else:
        db.add(models.Setting(key="admin_code", value=data.new_code))
    db.commit()
    return {"ok": True}
