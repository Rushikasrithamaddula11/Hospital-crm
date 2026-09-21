import os
import logging
from typing import Optional

logger = logging.getLogger("hospital_crm.firebase")

_firebase_app = None
_db = None

def init_firebase():
    global _firebase_app, _db
    use_firebase = os.getenv("USE_FIREBASE", "false").lower() in ("true", "1", "yes")
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")

    if not use_firebase:
        logger.info("Firebase is disabled via USE_FIREBASE=false. Using SQL database.")
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                _firebase_app = firebase_admin.initialize_app(cred)
                logger.info(f"Firebase initialized using certificate: {cred_path}")
            else:
                # Try application default credentials
                _firebase_app = firebase_admin.initialize_app()
                logger.info("Firebase initialized using Application Default Credentials")

        _db = firestore.client()
        return _db
    except Exception as e:
        logger.warning(f"Failed to initialize Firebase: {e}. Falling back to default DB engine.")
        return None

def get_firestore_db():
    global _db
    if _db is None:
        _db = init_firebase()
    return _db
