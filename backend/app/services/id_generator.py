import re
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.database.firebase_config import get_firestore_db

def generate_patient_id(db: Session = None) -> str:
    """
    Safely generates a unique Patient ID in sequential format: PT-000001, PT-000002, etc.
    Supports Firestore or SQL database.
    """
    firestore_db = get_firestore_db()
    if firestore_db:
        try:
            patients_ref = firestore_db.collection("patients")
            docs = patients_ref.order_by("created_at", direction="DESCENDING").limit(1).get()
            if docs:
                last_doc = docs[0].to_dict()
                last_pid = last_doc.get("patient_id", "PT-000000")
                match = re.search(r"PT-(\d+)", last_pid)
                if match:
                    next_num = int(match.group(1)) + 1
                    return f"PT-{next_num:06d}"
        except Exception as e:
            print(f"Firestore ID generation fallback to SQL: {e}")

    if db is not None:
        existing_pids = db.query(Patient.patient_id).all()
        max_num = 0
        for (pid,) in existing_pids:
            if pid and pid.startswith("PT-"):
                try:
                    num_part = int(pid.split("-")[1])
                    if num_part > max_num:
                        max_num = num_part
                except (ValueError, IndexError):
                    pass
        
        next_num = max_num + 1 if max_num > 0 else (db.query(Patient).count() + 1)
        return f"PT-{next_num:06d}"

    return "PT-000001"
