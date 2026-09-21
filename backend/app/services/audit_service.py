from datetime import datetime
from sqlalchemy.orm import Session
from app.models.patient import AuditLog
from app.database.firebase_config import get_firestore_db

def create_audit_log(
    db: Session,
    patient_id_str: str,
    action: str,
    details: str = None,
    performed_by: str = "Receptionist R102",
    role: str = "Receptionist"
):
    """
    Records audit actions into SQL AuditLog and Firebase Firestore if enabled.
    """
    now = datetime.utcnow()
    # SQL insertion
    log_entry = AuditLog(
        patient_id_str=patient_id_str,
        action=action,
        performed_by=performed_by,
        role=role,
        timestamp=now,
        details=details
    )
    db.add(log_entry)
    db.commit()

    # Firestore insertion
    firestore_db = get_firestore_db()
    if firestore_db:
        try:
            firestore_db.collection("audit_logs").add({
                "patient_id_str": patient_id_str,
                "action": action,
                "performed_by": performed_by,
                "role": role,
                "timestamp": now.isoformat(),
                "details": details
            })
        except Exception as e:
            print(f"Firestore audit log error: {e}")

    return log_entry
