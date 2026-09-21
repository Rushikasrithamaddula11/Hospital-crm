from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Text, desc, or_
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.database.base import Base
from app.models.patient import Patient
from app.services.audit_service import create_audit_log

# SQLAlchemy ORM Model for Notification Log
class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id_str = Column(String, nullable=True, index=True)
    recipient_name = Column(String, nullable=False)
    channel = Column(String, nullable=False)  # SMS, WhatsApp, Email, System Alert
    recipient = Column(String, nullable=False)  # Phone or Email
    template_type = Column(String, nullable=False, default="Appointment Reminder")
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="Delivered")  # Delivered, Sent, Failed, Pending
    timestamp = Column(DateTime, default=datetime.utcnow)


router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationCreate(BaseModel):
    patient_identifier: Optional[str] = Field(None, description="Patient ID (PT-xxxxxx) or integer ID")
    channel: str = Field(..., description="SMS, WhatsApp, Email, System Alert")
    recipient: str = Field(..., description="Phone number or email address")
    template_type: str = Field(default="Custom Notification")
    message: str = Field(..., min_length=1)


@router.get("", response_model=dict)
def list_all_notifications(
    q: Optional[str] = Query(None, description="Search by Recipient Name, Patient ID, Phone/Email, or Message"),
    channel: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    Base.metadata.create_all(bind=db.get_bind())

    # Seed sample notifications if empty
    if db.query(NotificationLog).count() == 0:
        seed_notifs = [
            {"patient_id_str": "PT-000001", "recipient_name": "Ravi Kumar", "channel": "SMS", "recipient": "9876543210", "template_type": "Appointment Reminder", "message": "Dear Ravi Kumar, your appointment with Dr. Raj Kumar (Cardiology) is scheduled for 25 Sep 2026 at 10:30 AM. - Mentneo Hospital", "status": "Delivered", "timestamp": datetime.utcnow()},
            {"patient_id_str": "PT-000002", "recipient_name": "Priya Sharma", "channel": "WhatsApp", "recipient": "9876543221", "template_type": "Lab Report Ready", "message": "Hello Priya Sharma, your Lipid Profile lab report is now ready. You can view findings in Mentneo Patient Portal.", "status": "Delivered", "timestamp": datetime.utcnow()},
            {"patient_id_str": "PT-000003", "recipient_name": "Arun Rao", "channel": "SMS", "recipient": "9876543245", "template_type": "Follow-up Alert", "message": "Dear Arun Rao, your follow-up consultation is due on 22 Sep 2026 with Dr. Anil Sharma. Please bring your recent test reports.", "status": "Delivered", "timestamp": datetime.utcnow()},
            {"patient_id_str": "PT-000004", "recipient_name": "Sunita Patel", "channel": "Email", "recipient": "sunita.patel@example.com", "template_type": "Prescription Summary", "message": "Dear Sunita Patel, electronic prescription #RX-1029 has been dispatched by Dr. Sneha Kulkarni.", "status": "Sent", "timestamp": datetime.utcnow()}
        ]
        for n_data in seed_notifs:
            db.add(NotificationLog(**n_data))
        db.commit()

    query = db.query(NotificationLog)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                NotificationLog.recipient_name.ilike(term),
                NotificationLog.patient_id_str.ilike(term),
                NotificationLog.recipient.ilike(term),
                NotificationLog.message.ilike(term)
            )
        )

    if channel and channel != "All":
        query = query.filter(NotificationLog.channel.ilike(channel.strip()))

    if status_filter and status_filter != "All":
        query = query.filter(NotificationLog.status.ilike(status_filter.strip()))

    total = query.count()
    logs = query.order_by(desc(NotificationLog.timestamp)).offset(skip).limit(limit).all()

    items = []
    for log in logs:
        items.append({
            "id": log.id,
            "patient_id_str": log.patient_id_str,
            "recipient_name": log.recipient_name,
            "channel": log.channel,
            "recipient": log.recipient,
            "template_type": log.template_type,
            "message": log.message,
            "status": log.status,
            "timestamp": log.timestamp.isoformat()
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def send_notification(
    notif_in: NotificationCreate,
    db: Session = Depends(get_db)
):
    recipient_name = "Hospital Patient / Staff"
    pid_str = None

    if notif_in.patient_identifier and notif_in.patient_identifier.strip():
        identifier = notif_in.patient_identifier.strip()
        if identifier.isdigit():
            p = db.query(Patient).filter(Patient.id == int(identifier)).first()
        else:
            p = db.query(Patient).filter(Patient.patient_id == identifier.upper()).first()

        if p:
            pid_str = p.patient_id
            recipient_name = f"{p.first_name} {p.last_name}"

    new_notif = NotificationLog(
        patient_id_str=pid_str,
        recipient_name=recipient_name,
        channel=notif_in.channel,
        recipient=notif_in.recipient,
        template_type=notif_in.template_type,
        message=notif_in.message,
        status="Delivered",
        timestamp=datetime.utcnow()
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    if pid_str:
        create_audit_log(
            db=db,
            patient_id_str=pid_str,
            action="Notification Dispatched",
            details=f"Dispatched {notif_in.channel} notification ({notif_in.template_type}) to {notif_in.recipient}"
        )

    return {
        "id": new_notif.id,
        "patient_id_str": new_notif.patient_id_str,
        "recipient_name": new_notif.recipient_name,
        "channel": new_notif.channel,
        "recipient": new_notif.recipient,
        "template_type": new_notif.template_type,
        "message": new_notif.message,
        "status": new_notif.status,
        "timestamp": new_notif.timestamp.isoformat()
    }
